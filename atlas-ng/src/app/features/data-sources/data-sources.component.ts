import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SourceService, Source, MOCK_SOURCE_KEY } from '../../core/services/source.service';
import { catchError, of } from 'rxjs';

interface SourceWithStatus extends Source {
  connectionStatus: 'connected' | 'disconnected' | 'checking' | 'unknown';
}

@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './data-sources.component.html',
  styleUrl: './data-sources.component.scss',
})
export class DataSourcesComponent implements OnInit {
  private sourceService = inject(SourceService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  sources = signal<SourceWithStatus[]>([]);
  error = signal<string | null>(null);

  // WebAPI connection status from service
  webApiConnected = this.sourceService.webApiConnected;
  webApiError = this.sourceService.webApiError;
  isConnecting = this.sourceService.isConnecting;

  // Count of real (non-mock) sources
  realSourceCount = computed(() =>
    this.sources().filter((s) => s.sourceKey !== MOCK_SOURCE_KEY).length
  );

  ngOnInit(): void {
    this.loadSources();
  }

  loadSources(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sourceService
      .initializeSources()
      .pipe(
        catchError((err) => {
          console.error('Failed to load sources:', err);
          this.error.set('Failed to load data sources. Please check your connection.');
          return of({ sources: [], priorities: {} });
        })
      )
      .subscribe(({ sources }) => {
        const sourcesWithStatus: SourceWithStatus[] = sources.map((s) => ({
          ...s,
          connectionStatus: 'unknown' as const,
        }));
        this.sources.set(sourcesWithStatus);
        this.loading.set(false);

        // Auto-check connections for all sources
        sourcesWithStatus.forEach((source) => {
          this.checkConnectionSilent(source);
        });
      });
  }

  refreshAll(): void {
    this.loadSources();
  }

  connectToWebApi(): void {
    this.sourceService
      .connectToWebApi()
      .pipe(
        catchError((err) => {
          this.snackBar.open(
            `Failed to connect to WebAPI: ${err.message || 'Connection refused'}`,
            'OK',
            { duration: 5000 }
          );
          return of([]);
        })
      )
      .subscribe((sources) => {
        if (sources.length > 0) {
          const sourcesWithStatus: SourceWithStatus[] = sources.map((s) => ({
            ...this.sourceService['enrichSource'](s),
            connectionStatus: 'unknown' as const,
          }));
          this.sources.set(sourcesWithStatus);

          const realCount = sources.filter((s) => s.sourceKey !== MOCK_SOURCE_KEY).length;
          this.snackBar.open(
            `Connected to WebAPI! Found ${realCount} data source${realCount !== 1 ? 's' : ''}.`,
            'OK',
            { duration: 3000 }
          );

          // Auto-check connections
          sourcesWithStatus.forEach((source) => {
            this.checkConnectionSilent(source);
          });
        }
      });
  }

  checkConnection(source: SourceWithStatus): void {
    this.updateSourceStatus(source.sourceKey, 'checking');

    this.sourceService
      .checkSourceConnection(source.sourceKey)
      .pipe(
        catchError((err) => {
          console.error(`Connection check failed for ${source.sourceKey}:`, err);
          return of(null);
        })
      )
      .subscribe((result) => {
        const status = result ? 'connected' : 'disconnected';
        this.updateSourceStatus(source.sourceKey, status);

        this.snackBar.open(
          result
            ? `${source.sourceName} is connected`
            : `${source.sourceName} connection failed`,
          'OK',
          { duration: 3000 }
        );
      });
  }

  private checkConnectionSilent(source: SourceWithStatus): void {
    this.updateSourceStatus(source.sourceKey, 'checking');

    this.sourceService
      .checkSourceConnection(source.sourceKey)
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        const status = result ? 'connected' : 'disconnected';
        this.updateSourceStatus(source.sourceKey, status);
      });
  }

  private updateSourceStatus(
    sourceKey: string,
    status: 'connected' | 'disconnected' | 'checking' | 'unknown'
  ): void {
    const sources = this.sources();
    const index = sources.findIndex((s) => s.sourceKey === sourceKey);
    if (index >= 0) {
      const updated = [...sources];
      updated[index] = { ...updated[index], connectionStatus: status };
      this.sources.set(updated);
    }
  }

  refreshCache(source: SourceWithStatus): void {
    this.snackBar.open(`Refreshing cache for ${source.sourceName}...`, '', {
      duration: 2000,
    });

    this.sourceService
      .refreshSourceCache(source.sourceKey)
      .pipe(
        catchError((err) => {
          console.error('Cache refresh failed:', err);
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.snackBar.open(`Cache refreshed for ${source.sourceName}`, 'OK', {
            duration: 3000,
          });
        } else {
          this.snackBar.open(`Failed to refresh cache`, 'OK', { duration: 3000 });
        }
      });
  }

  getDaimonIcon(type: string): string {
    const icons: Record<string, string> = {
      CDM: 'fas fa-database',
      Vocabulary: 'fas fa-book',
      Results: 'fas fa-chart-bar',
      Temp: 'fas fa-clock',
      CEM: 'fas fa-project-diagram',
      CEMResults: 'fas fa-flask',
    };
    return icons[type] || 'fas fa-cube';
  }

  formatDaimonType(type: string): string {
    return type;
  }

  getDialectDisplayName(dialect: string): string {
    const dialects: Record<string, string> = {
      postgresql: 'PostgreSQL',
      'sql server': 'SQL Server',
      oracle: 'Oracle',
      redshift: 'Redshift',
      bigquery: 'BigQuery',
      spark: 'Spark',
      snowflake: 'Snowflake',
      synapse: 'Synapse',
      mock: 'Mock Data',
    };
    return dialects[dialect?.toLowerCase()] || dialect;
  }
}

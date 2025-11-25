import { Component, OnInit, signal } from '@angular/core';
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

interface DataSource {
  sourceId: number;
  sourceName: string;
  sourceDialect: string;
  sourceKey: string;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  daimons: Daimon[];
}

interface Daimon {
  daimonType: string;
  tableQualifier: string;
  priority: number;
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
  ],
  templateUrl: './data-sources.component.html',
  styleUrl: './data-sources.component.scss',
})
export class DataSourcesComponent implements OnInit {
  loading = signal(true);
  sources = signal<DataSource[]>([]);

  ngOnInit(): void {
    this.loadSources();
  }

  private loadSources(): void {
    // Simulate loading data sources (would call SourceService in real app)
    setTimeout(() => {
      this.sources.set([
        {
          sourceId: 1,
          sourceName: 'SYNPUF 1K',
          sourceDialect: 'postgresql',
          sourceKey: 'SYNPUF1K',
          connectionStatus: 'connected',
          daimons: [
            { daimonType: 'CDM', tableQualifier: 'cdm_synpuf', priority: 1 },
            { daimonType: 'Vocabulary', tableQualifier: 'cdm_synpuf', priority: 1 },
            { daimonType: 'Results', tableQualifier: 'results_synpuf', priority: 1 },
            { daimonType: 'Temp', tableQualifier: 'temp_synpuf', priority: 0 },
          ],
        },
        {
          sourceId: 2,
          sourceName: 'SYNPUF 5%',
          sourceDialect: 'sql server',
          sourceKey: 'SYNPUF5PCT',
          connectionStatus: 'connected',
          daimons: [
            { daimonType: 'CDM', tableQualifier: 'cdm_synpuf5', priority: 1 },
            { daimonType: 'Vocabulary', tableQualifier: 'vocab', priority: 1 },
            { daimonType: 'Results', tableQualifier: 'results_synpuf5', priority: 1 },
          ],
        },
        {
          sourceId: 3,
          sourceName: 'Production CDM',
          sourceDialect: 'oracle',
          sourceKey: 'PRODCDM',
          connectionStatus: 'disconnected',
          daimons: [
            { daimonType: 'CDM', tableQualifier: 'CDM_PROD', priority: 1 },
            { daimonType: 'Vocabulary', tableQualifier: 'VOCAB', priority: 1 },
          ],
        },
      ]);
      this.loading.set(false);
    }, 800);
  }

  refreshAll(): void {
    this.loading.set(true);
    this.loadSources();
  }

  checkConnection(source: DataSource): void {
    const sources = this.sources();
    const index = sources.findIndex((s) => s.sourceId === source.sourceId);
    if (index >= 0) {
      sources[index] = { ...sources[index], connectionStatus: 'checking' };
      this.sources.set([...sources]);

      // Simulate connection check
      setTimeout(() => {
        const updated = this.sources();
        updated[index] = {
          ...updated[index],
          connectionStatus: Math.random() > 0.3 ? 'connected' : 'disconnected',
        };
        this.sources.set([...updated]);
      }, 1500);
    }
  }

  getDaimonIcon(type: string): string {
    const icons: Record<string, string> = {
      CDM: 'fas fa-database',
      Vocabulary: 'fas fa-book',
      Results: 'fas fa-chart-bar',
      Temp: 'fas fa-clock',
      CEM: 'fas fa-project-diagram',
    };
    return icons[type] || 'fas fa-cube';
  }

  formatDaimonType(type: string): string {
    return type;
  }
}

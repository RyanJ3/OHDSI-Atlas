import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InclusionReportDialogComponent } from './inclusion-report-dialog/inclusion-report-dialog.component';
import { SamplePatientsDialogComponent } from './sample-patients-dialog/sample-patients-dialog.component';

// Import mock data
import cohortDefinitionsData from '../../../core/mock-data/cohort-definitions.json';
import cohortGenerationsData from '../../../core/mock-data/cohort-generations.json';

interface GenerationResult {
  sourceKey: string;
  sourceName: string;
  status: 'COMPLETE' | 'RUNNING' | 'ERROR' | 'PENDING';
  personCount: number;
  recordCount: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
}

interface CohortInfo {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
}

@Component({
  selector: 'app-cohort-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './cohort-results.component.html',
  styleUrl: './cohort-results.component.scss',
})
export class CohortResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  cohortId = signal<number>(0);
  cohort = signal<CohortInfo | null>(null);
  results = signal<GenerationResult[]>([]);
  loading = signal(true);

  displayedColumns = [
    'sourceName',
    'status',
    'personCount',
    'recordCount',
    'duration',
    'actions',
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cohortId.set(parseInt(id, 10));
      this.loadCohortResults();
    }
  }

  private loadCohortResults(): void {
    // Load cohort info and results from mock data
    setTimeout(() => {
      const cohortData = (cohortDefinitionsData as any[]).find(
        (c) => c.id === this.cohortId()
      );

      if (cohortData) {
        this.cohort.set({
          id: cohortData.id,
          name: cohortData.name,
          description: cohortData.description,
          createdBy: cohortData.createdBy,
          createdDate: new Date(cohortData.createdDate),
          modifiedDate: new Date(cohortData.modifiedDate),
        });
      } else {
        // Fallback if cohort not found
        this.cohort.set({
          id: this.cohortId(),
          name: `Cohort ${this.cohortId()}`,
          description: 'Cohort definition',
          createdBy: 'unknown',
          createdDate: new Date(),
          modifiedDate: new Date(),
        });
      }

      // Get generation results for this cohort
      const generationResults = (cohortGenerationsData as any[])
        .filter((g) => g.cohortId === this.cohortId())
        .map((g) => ({
          sourceKey: g.sourceKey,
          sourceName: g.sourceName,
          status: g.status as 'COMPLETE' | 'RUNNING' | 'ERROR' | 'PENDING',
          personCount: g.personCount,
          recordCount: g.recordCount,
          startTime: new Date(g.startTime),
          endTime: g.endTime ? new Date(g.endTime) : undefined,
          duration: g.duration,
          errorMessage: g.errorMessage,
        }));

      this.results.set(generationResults);
      this.loading.set(false);
    }, 400);
  }

  goBack(): void {
    this.router.navigate(['/cohortdefinitions']);
  }

  regenerate(result: GenerationResult): void {
    this.snackBar.open(`Regenerating cohort on ${result.sourceName}...`, '', {
      duration: 2000,
    });
  }

  cancelGeneration(result: GenerationResult): void {
    this.snackBar.open(`Cancelling generation on ${result.sourceName}...`, '', {
      duration: 2000,
    });
  }

  viewInclusionReport(result: GenerationResult): void {
    const cohortInfo = this.cohort();
    this.dialog.open(InclusionReportDialogComponent, {
      width: '700px',
      data: {
        cohortId: this.cohortId(),
        cohortName: cohortInfo?.name || 'Cohort',
        sourceKey: result.sourceKey,
        sourceName: result.sourceName,
        personCount: result.personCount,
      },
    });
  }

  viewSamples(result: GenerationResult): void {
    const cohortInfo = this.cohort();
    this.dialog.open(SamplePatientsDialogComponent, {
      width: '850px',
      maxHeight: '80vh',
      data: {
        cohortId: this.cohortId(),
        cohortName: cohortInfo?.name || 'Cohort',
        sourceKey: result.sourceKey,
        sourceName: result.sourceName,
        personCount: result.personCount,
      },
    });
  }

  exportResults(result: GenerationResult): void {
    this.snackBar.open(`Exporting results from ${result.sourceName}...`, '', {
      duration: 2000,
    });
  }

  deleteGeneration(result: GenerationResult): void {
    this.snackBar.open(`Deleting generation for ${result.sourceName}...`, '', {
      duration: 2000,
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETE':
        return 'fas fa-check-circle';
      case 'RUNNING':
        return 'fas fa-spinner fa-spin';
      case 'ERROR':
        return 'fas fa-exclamation-circle';
      case 'PENDING':
        return 'fas fa-clock';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  getTotalPersonCount(): number {
    return this.results()
      .filter((r) => r.status === 'COMPLETE')
      .reduce((sum, r) => sum + r.personCount, 0);
  }

  getCompletedCount(): number {
    return this.results().filter((r) => r.status === 'COMPLETE').length;
  }
}

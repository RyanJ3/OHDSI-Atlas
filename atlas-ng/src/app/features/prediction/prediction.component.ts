import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Import mock data
import predictionsData from '../../core/mock-data/predictions.json';
import { PredictionResultsDialogComponent } from './prediction-results-dialog/prediction-results-dialog.component';
import { CreatePredictionDialogComponent } from './create-prediction-dialog/create-prediction-dialog.component';
import { EditPredictionDialogComponent } from './edit-prediction-dialog/edit-prediction-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface LatestExecution {
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'STOPPED';
  date: string;
  sourceName: string;
  auc: number | null;
  calibration: number | null;
}

interface Prediction {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  modelType: string;
  targetCohort: string;
  outcomeCohort: string;
  timeAtRisk: string;
  tags: string[];
  executions: number;
  latestExecution: LatestExecution | null;
}

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    MatSortModule,
    MatSnackBarModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './prediction.component.html',
  styleUrl: './prediction.component.scss',
})
export class PredictionComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  predictions = signal<Prediction[]>([]);
  filteredPredictions = signal<Prediction[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  statusFilter = 'all';
  modelTypeFilter = 'all';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'modelType',
    'cohorts',
    'performance',
    'status',
    'modifiedDate',
    'actions',
  ];

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'RUNNING', label: 'Running' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'NOT_EXECUTED', label: 'Not Executed' },
  ];

  modelTypeOptions = [
    { value: 'all', label: 'All Model Types' },
    { value: 'Lasso Logistic Regression', label: 'Lasso Logistic Regression' },
    { value: 'Gradient Boosting Machine', label: 'Gradient Boosting Machine' },
    { value: 'Random Forest', label: 'Random Forest' },
    { value: 'Neural Network', label: 'Neural Network' },
    { value: 'Ensemble Model', label: 'Ensemble Model' },
  ];

  ngOnInit(): void {
    this.loadPredictions();
  }

  loadPredictions(): void {
    this.loading.set(true);
    setTimeout(() => {
      const predictions = (predictionsData as Prediction[]).sort(
        (a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
      );
      this.predictions.set(predictions);
      this.applyFilters();
      this.loading.set(false);
    }, 300);
  }

  applyFilters(): void {
    let filtered = [...this.predictions()];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'NOT_EXECUTED') {
        filtered = filtered.filter((p) => !p.latestExecution);
      } else {
        filtered = filtered.filter((p) => p.latestExecution?.status === this.statusFilter);
      }
    }

    // Apply model type filter
    if (this.modelTypeFilter !== 'all') {
      filtered = filtered.filter((p) => p.modelType === this.modelTypeFilter);
    }

    // Apply search filter
    const search = this.searchFilter.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.targetCohort.toLowerCase().includes(search) ||
          p.outcomeCohort.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search)) ||
          p.modifiedBy.toLowerCase().includes(search)
      );
    }

    this.filteredPredictions.set(filtered);
    this.totalResults.set(filtered.length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredPredictions()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredPredictions.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.id, b.id, isAsc);
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'modelType':
            return this.compare(a.modelType, b.modelType, isAsc);
          case 'modifiedDate':
            return this.compare(a.modifiedDate, b.modifiedDate, isAsc);
          case 'performance':
            return this.compare(
              a.latestExecution?.auc || 0,
              b.latestExecution?.auc || 0,
              isAsc
            );
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedPredictions(): Prediction[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPredictions().slice(start, end);
  }

  getStatusClass(prediction: Prediction): string {
    if (!prediction.latestExecution) {
      return 'status-not-executed';
    }
    return `status-${prediction.latestExecution.status.toLowerCase()}`;
  }

  getStatusIcon(prediction: Prediction): string {
    if (!prediction.latestExecution) {
      return 'fas fa-minus-circle';
    }
    switch (prediction.latestExecution.status) {
      case 'COMPLETED':
        return 'fas fa-check-circle';
      case 'RUNNING':
        return 'fas fa-spinner fa-spin';
      case 'FAILED':
        return 'fas fa-exclamation-circle';
      case 'STOPPED':
        return 'fas fa-stop-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusLabel(prediction: Prediction): string {
    if (!prediction.latestExecution) {
      return 'Not Executed';
    }
    return prediction.latestExecution.status;
  }

  formatAuc(auc: number | null | undefined): string {
    if (auc === null || auc === undefined) return '-';
    return auc.toFixed(2);
  }

  getAucClass(auc: number | null | undefined): string {
    if (auc === null || auc === undefined) return '';
    if (auc >= 0.8) return 'auc-excellent';
    if (auc >= 0.7) return 'auc-good';
    if (auc >= 0.6) return 'auc-fair';
    return 'auc-poor';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  createNew(): void {
    const dialogRef = this.dialog.open(CreatePredictionDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result: Prediction | undefined) => {
      if (result) {
        this.predictions.update(current => [result, ...current]);
        this.applyFilters();
        this.snackBar.open(`Created prediction model "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editPrediction(prediction: Prediction): void {
    const dialogRef = this.dialog.open(EditPredictionDialogComponent, {
      width: '750px',
      maxHeight: '90vh',
      data: { prediction: { ...prediction, tags: [...(prediction.tags || [])] } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.predictions.update(current =>
          current.map(p => p.id === result.id ? result : p)
        );
        this.applyFilters();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  executePrediction(prediction: Prediction): void {
    // Simulate starting model training
    this.predictions.update(current =>
      current.map(p => {
        if (p.id === prediction.id) {
          return {
            ...p,
            latestExecution: {
              status: 'RUNNING' as const,
              date: new Date().toISOString(),
              sourceName: 'SynPUF-CDMV5',
              auc: null,
              calibration: null,
            },
          };
        }
        return p;
      })
    );
    this.applyFilters();
    this.snackBar.open(`Training model "${prediction.name}"...`, 'OK', { duration: 3000 });

    // Simulate completion after 4 seconds
    setTimeout(() => {
      this.predictions.update(current =>
        current.map(p => {
          if (p.id === prediction.id && p.latestExecution?.status === 'RUNNING') {
            return {
              ...p,
              executions: p.executions + 1,
              latestExecution: {
                status: 'COMPLETED' as const,
                date: new Date().toISOString(),
                sourceName: 'SynPUF-CDMV5',
                auc: Math.round((0.7 + Math.random() * 0.2) * 100) / 100,
                calibration: Math.round((0.9 + Math.random() * 0.1) * 100) / 100,
              },
            };
          }
          return p;
        })
      );
      this.applyFilters();
      this.snackBar.open(`Model training complete for "${prediction.name}"`, 'OK', { duration: 3000 });
    }, 4000);
  }

  viewResults(prediction: Prediction): void {
    if (!prediction.latestExecution || prediction.latestExecution.status !== 'COMPLETED') {
      this.snackBar.open('No completed results available', 'OK', { duration: 2000 });
      return;
    }
    this.dialog.open(PredictionResultsDialogComponent, {
      data: { prediction },
      width: '850px',
      maxHeight: '90vh',
    });
  }

  copyPrediction(prediction: Prediction): void {
    const copiedPrediction: Prediction = {
      ...prediction,
      id: Math.floor(Math.random() * 10000) + 100,
      name: `${prediction.name} (Copy)`,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'demo',
      modifiedBy: 'demo',
      tags: [...(prediction.tags || [])],
      executions: 0,
      latestExecution: null,
    };

    this.predictions.update(current => [copiedPrediction, ...current]);
    this.applyFilters();
    this.snackBar.open(`Created copy "${copiedPrediction.name}"`, 'OK', { duration: 3000 });
  }

  exportPrediction(prediction: Prediction): void {
    const exportData = {
      name: prediction.name,
      description: prediction.description,
      modelType: prediction.modelType,
      targetCohort: prediction.targetCohort,
      outcomeCohort: prediction.outcomeCohort,
      timeAtRisk: prediction.timeAtRisk,
      tags: prediction.tags,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prediction-${prediction.id}-${prediction.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported "${prediction.name}"`, 'OK', { duration: 3000 });
  }

  deletePrediction(prediction: Prediction): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Prediction',
        message: `Are you sure you want to delete "${prediction.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.predictions.set(this.predictions().filter((p) => p.id !== prediction.id));
        this.applyFilters();
        this.snackBar.open(`Deleted "${prediction.name}"`, 'OK', { duration: 2000 });
      }
    });
  }

  getCompletedCount(): number {
    return this.predictions().filter((p) => p.latestExecution?.status === 'COMPLETED').length;
  }

  getRunningCount(): number {
    return this.predictions().filter((p) => p.latestExecution?.status === 'RUNNING').length;
  }

  getNotExecutedCount(): number {
    return this.predictions().filter((p) => !p.latestExecution).length;
  }

  getAverageAuc(): string {
    const completed = this.predictions().filter(
      (p) => p.latestExecution?.status === 'COMPLETED' && p.latestExecution.auc
    );
    if (completed.length === 0) return '-';
    const avgAuc =
      completed.reduce((sum, p) => sum + (p.latestExecution?.auc || 0), 0) / completed.length;
    return avgAuc.toFixed(2);
  }
}

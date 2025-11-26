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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

// Import mock data
import estimationsData from '../../core/mock-data/estimations.json';
import { EstimationResultsDialogComponent } from './estimation-results-dialog/estimation-results-dialog.component';
import { CreateEstimationDialogComponent } from './create-estimation-dialog/create-estimation-dialog.component';
import { EditEstimationDialogComponent } from './edit-estimation-dialog/edit-estimation-dialog.component';

interface Comparison {
  targetCohort: string;
  comparatorCohort: string;
  outcomes: string[];
}

interface LatestExecution {
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'STOPPED';
  date: string;
  sourceName: string;
}

interface Estimation {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  type: string;
  comparisons: Comparison[];
  tags: string[];
  executions: number;
  latestExecution: LatestExecution | null;
}

@Component({
  selector: 'app-estimation',
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
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './estimation.component.html',
  styleUrl: './estimation.component.scss',
})
export class EstimationComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  estimations = signal<Estimation[]>([]);
  filteredEstimations = signal<Estimation[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  statusFilter = 'all';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'type',
    'comparisons',
    'status',
    'modifiedDate',
    'actions',
  ];

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'RUNNING', label: 'Running' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'STOPPED', label: 'Stopped' },
    { value: 'NOT_EXECUTED', label: 'Not Executed' },
  ];

  ngOnInit(): void {
    this.loadEstimations();
  }

  loadEstimations(): void {
    this.loading.set(true);
    // Simulate loading from mock data
    setTimeout(() => {
      const estimations = (estimationsData as Estimation[]).sort(
        (a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
      );
      this.estimations.set(estimations);
      this.applyFilters();
      this.loading.set(false);
    }, 300);
  }

  applyFilters(): void {
    let filtered = [...this.estimations()];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'NOT_EXECUTED') {
        filtered = filtered.filter((e) => !e.latestExecution);
      } else {
        filtered = filtered.filter((e) => e.latestExecution?.status === this.statusFilter);
      }
    }

    // Apply search filter
    const search = this.searchFilter.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          e.description?.toLowerCase().includes(search) ||
          e.type.toLowerCase().includes(search) ||
          e.tags.some((t) => t.toLowerCase().includes(search)) ||
          e.modifiedBy.toLowerCase().includes(search)
      );
    }

    this.filteredEstimations.set(filtered);
    this.totalResults.set(filtered.length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredEstimations()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredEstimations.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.id, b.id, isAsc);
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'type':
            return this.compare(a.type, b.type, isAsc);
          case 'modifiedDate':
            return this.compare(a.modifiedDate, b.modifiedDate, isAsc);
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedEstimations(): Estimation[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEstimations().slice(start, end);
  }

  getStatusClass(estimation: Estimation): string {
    if (!estimation.latestExecution) {
      return 'status-not-executed';
    }
    return `status-${estimation.latestExecution.status.toLowerCase()}`;
  }

  getStatusIcon(estimation: Estimation): string {
    if (!estimation.latestExecution) {
      return 'fas fa-minus-circle';
    }
    switch (estimation.latestExecution.status) {
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

  getStatusLabel(estimation: Estimation): string {
    if (!estimation.latestExecution) {
      return 'Not Executed';
    }
    return estimation.latestExecution.status;
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
    const dialogRef = this.dialog.open(CreateEstimationDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result: Estimation | undefined) => {
      if (result) {
        this.estimations.update(current => [result, ...current]);
        this.applyFilters();
        this.snackBar.open(`Created estimation study "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editEstimation(estimation: Estimation): void {
    const dialogRef = this.dialog.open(EditEstimationDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { estimation: { ...estimation, tags: [...(estimation.tags || [])], comparisons: [...(estimation.comparisons || [])] } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.estimations.update(current =>
          current.map(e => e.id === result.id ? result : e)
        );
        this.applyFilters();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  executeEstimation(estimation: Estimation): void {
    // Simulate starting execution
    this.estimations.update(current =>
      current.map(e => {
        if (e.id === estimation.id) {
          return {
            ...e,
            latestExecution: {
              status: 'RUNNING' as const,
              date: new Date().toISOString(),
              sourceName: 'SynPUF-CDMV5',
            },
          };
        }
        return e;
      })
    );
    this.applyFilters();
    this.snackBar.open(`Executing "${estimation.name}"...`, 'OK', { duration: 3000 });

    // Simulate completion after 4 seconds
    setTimeout(() => {
      this.estimations.update(current =>
        current.map(e => {
          if (e.id === estimation.id && e.latestExecution?.status === 'RUNNING') {
            return {
              ...e,
              executions: e.executions + 1,
              latestExecution: {
                status: 'COMPLETED' as const,
                date: new Date().toISOString(),
                sourceName: 'SynPUF-CDMV5',
              },
            };
          }
          return e;
        })
      );
      this.applyFilters();
      this.snackBar.open(`Estimation complete for "${estimation.name}"`, 'OK', { duration: 3000 });
    }, 4000);
  }

  viewResults(estimation: Estimation): void {
    if (!estimation.latestExecution || estimation.latestExecution.status !== 'COMPLETED') {
      this.snackBar.open('No completed results available', 'OK', { duration: 2000 });
      return;
    }
    this.dialog.open(EstimationResultsDialogComponent, {
      data: { estimation },
      width: '950px',
      maxHeight: '90vh',
    });
  }

  copyEstimation(estimation: Estimation): void {
    const copiedEstimation: Estimation = {
      ...estimation,
      id: Math.floor(Math.random() * 10000) + 100,
      name: `${estimation.name} (Copy)`,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'demo',
      modifiedBy: 'demo',
      tags: [...(estimation.tags || [])],
      comparisons: [...(estimation.comparisons || [])],
      executions: 0,
      latestExecution: null,
    };

    this.estimations.update(current => [copiedEstimation, ...current]);
    this.applyFilters();
    this.snackBar.open(`Created copy "${copiedEstimation.name}"`, 'OK', { duration: 3000 });
  }

  exportEstimation(estimation: Estimation): void {
    const exportData = {
      name: estimation.name,
      description: estimation.description,
      type: estimation.type,
      comparisons: estimation.comparisons,
      tags: estimation.tags,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estimation-${estimation.id}-${estimation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported "${estimation.name}"`, 'OK', { duration: 3000 });
  }

  deleteEstimation(estimation: Estimation): void {
    if (confirm(`Are you sure you want to delete "${estimation.name}"?`)) {
      this.snackBar.open(`Deleted "${estimation.name}"`, '', { duration: 2000 });
      this.estimations.set(this.estimations().filter((e) => e.id !== estimation.id));
      this.applyFilters();
    }
  }

  getComparisonSummary(estimation: Estimation): string {
    const comp = estimation.comparisons[0];
    if (!comp) return '-';
    return `${comp.targetCohort} vs ${comp.comparatorCohort}`;
  }

  getOutcomeCount(estimation: Estimation): number {
    return estimation.comparisons.reduce((sum, c) => sum + c.outcomes.length, 0);
  }

  getCompletedCount(): number {
    return this.estimations().filter((e) => e.latestExecution?.status === 'COMPLETED').length;
  }

  getRunningCount(): number {
    return this.estimations().filter((e) => e.latestExecution?.status === 'RUNNING').length;
  }

  getNotExecutedCount(): number {
    return this.estimations().filter((e) => !e.latestExecution).length;
  }
}

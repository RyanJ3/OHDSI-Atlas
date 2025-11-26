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

// Import mock data
import estimationsData from '../../core/mock-data/estimations.json';

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
    this.snackBar.open('Create new estimation study (not implemented)', 'OK', {
      duration: 2000,
    });
  }

  editEstimation(estimation: Estimation): void {
    this.snackBar.open(`Opening "${estimation.name}"...`, '', { duration: 1500 });
  }

  executeEstimation(estimation: Estimation): void {
    this.snackBar.open(`Executing "${estimation.name}"...`, '', { duration: 2000 });
  }

  viewResults(estimation: Estimation): void {
    if (!estimation.latestExecution || estimation.latestExecution.status !== 'COMPLETED') {
      this.snackBar.open('No completed results available', 'OK', { duration: 2000 });
      return;
    }
    this.snackBar.open(`Viewing results for "${estimation.name}"...`, '', { duration: 2000 });
  }

  copyEstimation(estimation: Estimation): void {
    this.snackBar.open(`Copying "${estimation.name}"...`, '', { duration: 2000 });
  }

  exportEstimation(estimation: Estimation): void {
    this.snackBar.open(`Exporting "${estimation.name}"...`, '', { duration: 2000 });
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
}

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
import jobsData from '../../core/mock-data/jobs.json';
import { JobDetailsDialogComponent } from './job-details-dialog/job-details-dialog.component';

interface JobParameters {
  jobName: string;
  jobAuthor?: string;
  cohort_definition_id?: string;
  source_id?: string;
  analysis_id?: string;
  characterization_id?: string;
  pathway_id?: string;
  estimation_id?: string;
  prediction_id?: string;
}

interface Job {
  executionId: number;
  jobName: string;
  jobParameters: JobParameters;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'STOPPED' | 'STARTING' | 'UNKNOWN';
  startDate: string;
  endDate: string | null;
  exitStatus: string | null;
}

@Component({
  selector: 'app-jobs',
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
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
})
export class JobsComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  loading = signal(true);
  jobs = signal<Job[]>([]);
  filteredJobs = signal<Job[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  statusFilter = 'all';
  pageSize = 25;
  pageIndex = 0;
  autoRefresh = signal(true);

  displayedColumns = [
    'executionId',
    'jobName',
    'status',
    'author',
    'startDate',
    'endDate',
    'duration',
    'actions',
  ];

  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'RUNNING', label: 'Running' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'STOPPED', label: 'Stopped' },
  ];

  ngOnInit(): void {
    this.loadJobs();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadJobs(): void {
    // Simulate loading from mock data
    setTimeout(() => {
      const jobs = (jobsData as Job[]).sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      this.jobs.set(jobs);
      this.applyFilters();
      this.loading.set(false);
    }, 300);
  }

  refresh(): void {
    this.loading.set(true);
    this.loadJobs();
    this.snackBar.open('Jobs refreshed', '', { duration: 1500 });
  }

  startAutoRefresh(): void {
    if (this.refreshInterval) return;
    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh()) {
        this.loadJobs();
      }
    }, 30000); // Refresh every 30 seconds
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.set(!this.autoRefresh());
    if (this.autoRefresh()) {
      this.snackBar.open('Auto-refresh enabled (30s)', '', { duration: 2000 });
    } else {
      this.snackBar.open('Auto-refresh disabled', '', { duration: 2000 });
    }
  }

  applyFilters(): void {
    let filtered = [...this.jobs()];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === this.statusFilter);
    }

    // Apply search filter
    const search = this.searchFilter.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (job) =>
          job.executionId.toString().includes(search) ||
          job.jobName.toLowerCase().includes(search) ||
          job.jobParameters.jobName?.toLowerCase().includes(search) ||
          job.jobParameters.jobAuthor?.toLowerCase().includes(search)
      );
    }

    this.filteredJobs.set(filtered);
    this.totalResults.set(filtered.length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredJobs()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredJobs.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'executionId':
            return this.compare(a.executionId, b.executionId, isAsc);
          case 'jobName':
            return this.compare(
              a.jobParameters.jobName || a.jobName,
              b.jobParameters.jobName || b.jobName,
              isAsc
            );
          case 'status':
            return this.compare(a.status, b.status, isAsc);
          case 'author':
            return this.compare(
              a.jobParameters.jobAuthor || '',
              b.jobParameters.jobAuthor || '',
              isAsc
            );
          case 'startDate':
            return this.compare(a.startDate, b.startDate, isAsc);
          case 'endDate':
            return this.compare(a.endDate || '', b.endDate || '', isAsc);
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedJobs(): Job[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJobs().slice(start, end);
  }

  getJobDisplayName(job: Job): string {
    const paramName = job.jobParameters.jobName;
    if (paramName && paramName !== job.jobName) {
      return paramName;
    }

    // Prettify common job names
    const nameMap: Record<string, string> = {
      generateCohort: 'Generate Cohort',
      runIRAnalysis: 'Incidence Rate Analysis',
      runCharacterization: 'Characterization',
      runPathwayAnalysis: 'Pathway Analysis',
      runPLEAnalysis: 'Population Level Estimation',
      runPLPAnalysis: 'Patient Level Prediction',
      warmCache: 'Warm Cache',
    };

    return nameMap[job.jobName] || job.jobName;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'fas fa-check-circle';
      case 'RUNNING':
        return 'fas fa-spinner fa-spin';
      case 'FAILED':
        return 'fas fa-exclamation-circle';
      case 'STOPPED':
        return 'fas fa-stop-circle';
      case 'STARTING':
        return 'fas fa-hourglass-start';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  }

  calculateDuration(startDate: string, endDate: string | null): string {
    if (!endDate) return '-';
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const diffMs = end - start;

      if (diffMs < 0) return '-';

      const seconds = Math.floor(diffMs / 1000);
      if (seconds < 60) return `${seconds}s`;

      const minutes = Math.floor(seconds / 60);
      const remainingSecs = seconds % 60;
      if (minutes < 60) return `${minutes}m ${remainingSecs}s`;

      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours}h ${remainingMins}m`;
    } catch {
      return '-';
    }
  }

  getRunningDuration(startDate: string): string {
    try {
      const start = new Date(startDate).getTime();
      const now = Date.now();
      const diffMs = now - start;

      const seconds = Math.floor(diffMs / 1000);
      if (seconds < 60) return `${seconds}s`;

      const minutes = Math.floor(seconds / 60);
      const remainingSecs = seconds % 60;
      if (minutes < 60) return `${minutes}m ${remainingSecs}s`;

      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours}h ${remainingMins}m`;
    } catch {
      return '-';
    }
  }

  stopJob(job: Job): void {
    this.snackBar.open(`Stopping job ${job.executionId}...`, '', { duration: 2000 });
  }

  viewJobDetails(job: Job): void {
    this.dialog.open(JobDetailsDialogComponent, {
      data: { job },
      width: '600px',
    });
  }

  getRunningCount(): number {
    return this.jobs().filter((j) => j.status === 'RUNNING').length;
  }

  getCompletedCount(): number {
    return this.jobs().filter((j) => j.status === 'COMPLETED').length;
  }

  getFailedCount(): number {
    return this.jobs().filter((j) => j.status === 'FAILED').length;
  }

  getTotalCount(): number {
    return this.jobs().length;
  }
}

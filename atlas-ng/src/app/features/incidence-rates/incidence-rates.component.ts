import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Import mock data
import incidenceRatesData from '../../core/mock-data/incidence-rates.json';

interface Cohort {
  id: number;
  name: string;
}

interface TimeAtRiskPoint {
  offset: number;
  anchor: string;
}

interface TimeAtRisk {
  start: TimeAtRiskPoint;
  end: TimeAtRiskPoint;
}

interface ExecutionResults {
  totalPersons: number;
  cases: number;
  timeAtRisk: number;
  incidenceRate: number;
  incidenceProportion: number;
}

interface Execution {
  sourceKey: string;
  sourceName: string;
  status: 'COMPLETE' | 'RUNNING' | 'FAILED' | 'PENDING';
  startTime: string;
  endTime: string | null;
  results: ExecutionResults | null;
  errorMessage?: string;
}

interface IncidenceRateAnalysis {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  targetCohorts: Cohort[];
  outcomeCohorts: Cohort[];
  timeAtRisk: TimeAtRisk;
  executions: Execution[];
}

@Component({
  selector: 'app-incidence-rates',
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
    MatDividerModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './incidence-rates.component.html',
  styleUrl: './incidence-rates.component.scss',
})
export class IncidenceRatesComponent implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  analyses = signal<IncidenceRateAnalysis[]>([]);
  filteredAnalyses = signal<IncidenceRateAnalysis[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'targets',
    'outcomes',
    'executions',
    'modifiedBy',
    'modifiedDate',
    'actions',
  ];

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    this.loading.set(true);

    setTimeout(() => {
      const data = (incidenceRatesData as IncidenceRateAnalysis[]).sort(
        (a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
      );
      this.analyses.set(data);
      this.filteredAnalyses.set(data);
      this.totalResults.set(data.length);
      this.loading.set(false);
    }, 300);
  }

  applyFilter(): void {
    const filter = this.searchFilter.toLowerCase().trim();
    if (!filter) {
      this.filteredAnalyses.set(this.analyses());
    } else {
      this.filteredAnalyses.set(
        this.analyses().filter(
          (ir) =>
            ir.name.toLowerCase().includes(filter) ||
            ir.description?.toLowerCase().includes(filter) ||
            ir.createdBy?.toLowerCase().includes(filter) ||
            ir.modifiedBy?.toLowerCase().includes(filter) ||
            ir.targetCohorts.some((c) => c.name.toLowerCase().includes(filter)) ||
            ir.outcomeCohorts.some((c) => c.name.toLowerCase().includes(filter))
        )
      );
    }
    this.totalResults.set(this.filteredAnalyses().length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredAnalyses()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredAnalyses.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.id, b.id, isAsc);
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'modifiedBy':
            return this.compare(a.modifiedBy || '', b.modifiedBy || '', isAsc);
          case 'modifiedDate':
            return this.compare(a.modifiedDate || '', b.modifiedDate || '', isAsc);
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedAnalyses(): IncidenceRateAnalysis[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAnalyses().slice(start, end);
  }

  createNew(): void {
    this.snackBar.open('Create new IR analysis (not implemented)', '', { duration: 2000 });
  }

  editAnalysis(analysis: IncidenceRateAnalysis): void {
    this.snackBar.open(`Opening "${analysis.name}" for editing...`, '', { duration: 2000 });
  }

  copyAnalysis(analysis: IncidenceRateAnalysis): void {
    this.snackBar.open(`Copying "${analysis.name}"...`, '', { duration: 2000 });
  }

  deleteAnalysis(analysis: IncidenceRateAnalysis): void {
    if (confirm(`Are you sure you want to delete "${analysis.name}"?`)) {
      this.snackBar.open(`Deleted "${analysis.name}"`, '', { duration: 2000 });
    }
  }

  generateAnalysis(analysis: IncidenceRateAnalysis): void {
    this.snackBar.open(`Generating analysis "${analysis.name}"...`, '', { duration: 2000 });
  }

  viewResults(analysis: IncidenceRateAnalysis): void {
    this.snackBar.open(`Viewing results for "${analysis.name}"...`, '', { duration: 2000 });
  }

  exportAnalysis(analysis: IncidenceRateAnalysis): void {
    this.snackBar.open(`Exporting "${analysis.name}"...`, '', { duration: 2000 });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  getTargetNames(analysis: IncidenceRateAnalysis): string {
    return analysis.targetCohorts.map((c) => c.name).join(', ');
  }

  getOutcomeNames(analysis: IncidenceRateAnalysis): string {
    return analysis.outcomeCohorts.map((c) => c.name).join(', ');
  }

  getExecutionSummary(analysis: IncidenceRateAnalysis): string {
    if (analysis.executions.length === 0) return 'Not generated';

    const complete = analysis.executions.filter((e) => e.status === 'COMPLETE').length;
    const running = analysis.executions.filter((e) => e.status === 'RUNNING').length;
    const failed = analysis.executions.filter((e) => e.status === 'FAILED').length;

    const parts = [];
    if (complete > 0) parts.push(`${complete} complete`);
    if (running > 0) parts.push(`${running} running`);
    if (failed > 0) parts.push(`${failed} failed`);

    return parts.join(', ');
  }

  getExecutionStatusClass(analysis: IncidenceRateAnalysis): string {
    if (analysis.executions.length === 0) return 'status-none';
    if (analysis.executions.some((e) => e.status === 'RUNNING')) return 'status-running';
    if (analysis.executions.some((e) => e.status === 'FAILED')) return 'status-warning';
    if (analysis.executions.every((e) => e.status === 'COMPLETE')) return 'status-complete';
    return 'status-partial';
  }

  hasResults(analysis: IncidenceRateAnalysis): boolean {
    return analysis.executions.some((e) => e.status === 'COMPLETE' && e.results);
  }

  getLatestIncidenceRate(analysis: IncidenceRateAnalysis): string {
    const completeExec = analysis.executions.find(
      (e) => e.status === 'COMPLETE' && e.results
    );
    if (completeExec?.results) {
      return `${completeExec.results.incidenceRate.toFixed(2)} per 1,000 PY`;
    }
    return '-';
  }

  getTotalCount(): number {
    return this.analyses().length;
  }

  getGeneratedCount(): number {
    return this.analyses().filter((a) =>
      a.executions.some((e) => e.status === 'COMPLETE')
    ).length;
  }

  getRunningCount(): number {
    return this.analyses().filter((a) =>
      a.executions.some((e) => e.status === 'RUNNING')
    ).length;
  }
}

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
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import pathwaysData from '../../core/mock-data/pathways.json';

interface Cohort {
  id: number;
  name: string;
}

interface PathwayResult {
  path: string[];
  count: number;
  pct: number;
}

interface ExecutionResults {
  totalPatients: number;
  pathwaysFound: number;
  topPathways: PathwayResult[];
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

interface PathwayAnalysis {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  targetCohorts: Cohort[];
  eventCohorts: Cohort[];
  combinationWindow: number;
  minCellCount: number;
  maxDepth: number;
  allowRepeats: boolean;
  executions: Execution[];
}

@Component({
  selector: 'app-pathways',
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
  templateUrl: './pathways.component.html',
  styleUrl: './pathways.component.scss',
})
export class PathwaysComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  analyses = signal<PathwayAnalysis[]>([]);
  filteredAnalyses = signal<PathwayAnalysis[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'targets',
    'events',
    'settings',
    'executions',
    'modifiedDate',
    'actions',
  ];

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    this.loading.set(true);

    setTimeout(() => {
      const data = (pathwaysData as PathwayAnalysis[]).sort(
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
          (pa) =>
            pa.name.toLowerCase().includes(filter) ||
            pa.description?.toLowerCase().includes(filter) ||
            pa.createdBy?.toLowerCase().includes(filter) ||
            pa.modifiedBy?.toLowerCase().includes(filter) ||
            pa.targetCohorts.some((c) => c.name.toLowerCase().includes(filter)) ||
            pa.eventCohorts.some((c) => c.name.toLowerCase().includes(filter))
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

  getPaginatedAnalyses(): PathwayAnalysis[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAnalyses().slice(start, end);
  }

  createNew(): void {
    this.snackBar.open('Create new pathway analysis (not implemented)', '', { duration: 2000 });
  }

  editAnalysis(analysis: PathwayAnalysis): void {
    this.snackBar.open(`Opening "${analysis.name}" for editing...`, '', { duration: 2000 });
  }

  copyAnalysis(analysis: PathwayAnalysis): void {
    this.snackBar.open(`Copying "${analysis.name}"...`, '', { duration: 2000 });
  }

  deleteAnalysis(analysis: PathwayAnalysis): void {
    if (confirm(`Are you sure you want to delete "${analysis.name}"?`)) {
      this.snackBar.open(`Deleted "${analysis.name}"`, '', { duration: 2000 });
    }
  }

  generateAnalysis(analysis: PathwayAnalysis): void {
    this.snackBar.open(`Generating pathway analysis "${analysis.name}"...`, '', { duration: 2000 });
  }

  viewResults(analysis: PathwayAnalysis): void {
    this.snackBar.open(`Viewing results for "${analysis.name}"...`, '', { duration: 2000 });
  }

  exportAnalysis(analysis: PathwayAnalysis): void {
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

  getExecutionSummary(analysis: PathwayAnalysis): string {
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

  getExecutionStatusClass(analysis: PathwayAnalysis): string {
    if (analysis.executions.length === 0) return 'status-none';
    if (analysis.executions.some((e) => e.status === 'RUNNING')) return 'status-running';
    if (analysis.executions.some((e) => e.status === 'FAILED')) return 'status-warning';
    if (analysis.executions.every((e) => e.status === 'COMPLETE')) return 'status-complete';
    return 'status-partial';
  }

  hasResults(analysis: PathwayAnalysis): boolean {
    return analysis.executions.some((e) => e.status === 'COMPLETE' && e.results);
  }

  getTopPathway(analysis: PathwayAnalysis): string {
    const completeExec = analysis.executions.find(
      (e) => e.status === 'COMPLETE' && e.results?.topPathways?.length
    );
    if (completeExec?.results?.topPathways?.[0]) {
      const top = completeExec.results.topPathways[0];
      return `${top.path.join(' → ')} (${top.pct.toFixed(1)}%)`;
    }
    return '-';
  }

  getSettingsSummary(analysis: PathwayAnalysis): string {
    return `Depth: ${analysis.maxDepth}, Window: ${analysis.combinationWindow}d`;
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

  getTotalPathwaysFound(): number {
    return this.analyses().reduce((sum, a) => {
      const completeExec = a.executions.find((e) => e.status === 'COMPLETE' && e.results);
      return sum + (completeExec?.results?.pathwaysFound || 0);
    }, 0);
  }

  getEventCohortNames(analysis: PathwayAnalysis): string {
    return analysis.eventCohorts.map((c) => c.name).join(', ');
  }
}

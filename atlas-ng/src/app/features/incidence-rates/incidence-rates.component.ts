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
import { IrResultsDialogComponent } from './ir-results-dialog/ir-results-dialog.component';
import { CreateIrDialogComponent } from './create-ir-dialog/create-ir-dialog.component';
import { EditIrDialogComponent } from './edit-ir-dialog/edit-ir-dialog.component';

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
    const dialogRef = this.dialog.open(CreateIrDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.analyses.update(current => [result, ...current]);
        this.applyFilter();
        this.snackBar.open(`Created IR analysis "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editAnalysis(analysis: IncidenceRateAnalysis): void {
    const dialogRef = this.dialog.open(EditIrDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { analysis: { ...analysis, targetCohorts: [...analysis.targetCohorts], outcomeCohorts: [...analysis.outcomeCohorts] } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.analyses.update(current =>
          current.map(a => a.id === result.id ? result : a)
        );
        this.applyFilter();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  copyAnalysis(analysis: IncidenceRateAnalysis): void {
    const copiedAnalysis: IncidenceRateAnalysis = {
      ...analysis,
      id: Math.floor(Math.random() * 10000) + 100,
      name: `${analysis.name} (Copy)`,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'demo',
      modifiedBy: 'demo',
      targetCohorts: [...analysis.targetCohorts],
      outcomeCohorts: [...analysis.outcomeCohorts],
      executions: [],
    };

    this.analyses.update(current => [copiedAnalysis, ...current]);
    this.applyFilter();
    this.snackBar.open(`Created copy "${copiedAnalysis.name}"`, 'OK', { duration: 3000 });
  }

  deleteAnalysis(analysis: IncidenceRateAnalysis): void {
    if (confirm(`Are you sure you want to delete "${analysis.name}"?`)) {
      this.analyses.update(current => current.filter(a => a.id !== analysis.id));
      this.applyFilter();
      this.snackBar.open(`Deleted "${analysis.name}"`, 'OK', { duration: 2000 });
    }
  }

  generateAnalysis(analysis: IncidenceRateAnalysis): void {
    const newExecution: Execution = {
      sourceKey: 'SynPUF-CDMV5',
      sourceName: 'Synthetic Claims Data',
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      endTime: null,
      results: null,
    };

    this.analyses.update(current =>
      current.map(a => {
        if (a.id === analysis.id) {
          return { ...a, executions: [...a.executions, newExecution] };
        }
        return a;
      })
    );
    this.applyFilter();
    this.snackBar.open(`Started IR analysis for "${analysis.name}"`, 'OK', { duration: 3000 });

    // Simulate completion after 3 seconds
    setTimeout(() => {
      this.analyses.update(current =>
        current.map(a => {
          if (a.id === analysis.id) {
            const updatedExecutions = a.executions.map(e => {
              if (e.status === 'RUNNING' && e.sourceKey === newExecution.sourceKey) {
                return {
                  ...e,
                  status: 'COMPLETE' as const,
                  endTime: new Date().toISOString(),
                  results: {
                    totalPersons: Math.floor(Math.random() * 50000) + 10000,
                    cases: Math.floor(Math.random() * 500) + 50,
                    timeAtRisk: Math.floor(Math.random() * 100000) + 50000,
                    incidenceRate: Math.round((Math.random() * 50 + 5) * 100) / 100,
                    incidenceProportion: Math.round((Math.random() * 0.05) * 10000) / 10000,
                  },
                };
              }
              return e;
            });
            return { ...a, executions: updatedExecutions };
          }
          return a;
        })
      );
      this.applyFilter();
      this.snackBar.open(`IR analysis complete for "${analysis.name}"`, 'OK', { duration: 3000 });
    }, 3000);
  }

  viewResults(analysis: IncidenceRateAnalysis): void {
    const completedExecution = analysis.executions.find(e => e.status === 'COMPLETE');
    if (!completedExecution) {
      this.snackBar.open('No completed results available', 'OK', { duration: 2000 });
      return;
    }
    this.dialog.open(IrResultsDialogComponent, {
      data: { analysis, execution: completedExecution },
      width: '850px',
      maxHeight: '90vh',
    });
  }

  exportAnalysis(analysis: IncidenceRateAnalysis): void {
    const exportData = {
      name: analysis.name,
      description: analysis.description,
      targetCohorts: analysis.targetCohorts,
      outcomeCohorts: analysis.outcomeCohorts,
      timeAtRisk: analysis.timeAtRisk,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ir-analysis-${analysis.id}-${analysis.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported "${analysis.name}"`, 'OK', { duration: 3000 });
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

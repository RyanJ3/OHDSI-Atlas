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

import characterizationsData from '../../core/mock-data/characterizations.json';
import { CharacterizationResultsDialogComponent } from './characterization-results-dialog/characterization-results-dialog.component';
import { CreateCharacterizationDialogComponent } from './create-characterization-dialog/create-characterization-dialog.component';
import { EditCharacterizationDialogComponent } from './edit-characterization-dialog/edit-characterization-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface Cohort {
  id: number;
  name: string;
}

interface FeatureAnalysis {
  id: number;
  name: string;
  type: 'PRESET' | 'CUSTOM';
}

interface Strata {
  id: number;
  name: string;
}

interface ExecutionResults {
  cohortCount: number;
  featuresAnalyzed: number;
  covariatesFound: number;
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

interface Characterization {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  cohorts: Cohort[];
  featureAnalyses: FeatureAnalysis[];
  stratas: Strata[];
  executions: Execution[];
}

@Component({
  selector: 'app-characterizations',
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
  templateUrl: './characterizations.component.html',
  styleUrl: './characterizations.component.scss',
})
export class CharacterizationsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  characterizations = signal<Characterization[]>([]);
  filteredCharacterizations = signal<Characterization[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'cohorts',
    'features',
    'stratas',
    'executions',
    'modifiedDate',
    'actions',
  ];

  ngOnInit(): void {
    this.loadCharacterizations();
  }

  loadCharacterizations(): void {
    this.loading.set(true);

    setTimeout(() => {
      const data = (characterizationsData as Characterization[]).sort(
        (a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
      );
      this.characterizations.set(data);
      this.filteredCharacterizations.set(data);
      this.totalResults.set(data.length);
      this.loading.set(false);
    }, 300);
  }

  applyFilter(): void {
    const filter = this.searchFilter.toLowerCase().trim();
    if (!filter) {
      this.filteredCharacterizations.set(this.characterizations());
    } else {
      this.filteredCharacterizations.set(
        this.characterizations().filter(
          (c) =>
            c.name.toLowerCase().includes(filter) ||
            c.description?.toLowerCase().includes(filter) ||
            c.createdBy?.toLowerCase().includes(filter) ||
            c.modifiedBy?.toLowerCase().includes(filter) ||
            c.cohorts.some((coh) => coh.name.toLowerCase().includes(filter)) ||
            c.featureAnalyses.some((fa) => fa.name.toLowerCase().includes(filter))
        )
      );
    }
    this.totalResults.set(this.filteredCharacterizations().length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredCharacterizations()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredCharacterizations.set(
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

  getPaginatedCharacterizations(): Characterization[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCharacterizations().slice(start, end);
  }

  createNew(): void {
    const dialogRef = this.dialog.open(CreateCharacterizationDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.characterizations.update(current => [result, ...current]);
        this.applyFilter();
        this.snackBar.open(`Created characterization "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editCharacterization(char: Characterization): void {
    const dialogRef = this.dialog.open(EditCharacterizationDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { characterization: { ...char, cohorts: [...char.cohorts], featureAnalyses: [...char.featureAnalyses], stratas: [...char.stratas] } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.characterizations.update(current =>
          current.map(c => c.id === result.id ? result : c)
        );
        this.applyFilter();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  copyCharacterization(char: Characterization): void {
    const copiedChar: Characterization = {
      ...char,
      id: Math.floor(Math.random() * 10000) + 100,
      name: `${char.name} (Copy)`,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'demo',
      modifiedBy: 'demo',
      cohorts: [...char.cohorts],
      featureAnalyses: [...char.featureAnalyses],
      stratas: [...char.stratas],
      executions: [], // Reset executions for the copy
    };

    this.characterizations.update(current => [copiedChar, ...current]);
    this.applyFilter();
    this.snackBar.open(`Created copy "${copiedChar.name}"`, 'OK', { duration: 3000 });
  }

  deleteCharacterization(char: Characterization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Characterization',
        message: `Are you sure you want to delete "${char.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.characterizations.update(current => current.filter(c => c.id !== char.id));
        this.applyFilter();
        this.snackBar.open(`Deleted "${char.name}"`, 'OK', { duration: 2000 });
      }
    });
  }

  generateCharacterization(char: Characterization): void {
    // Simulate starting a generation job
    const newExecution = {
      sourceKey: 'SynPUF-CDMV5',
      sourceName: 'Synthetic Claims Data',
      status: 'RUNNING' as const,
      startTime: new Date().toISOString(),
      endTime: null,
      results: null,
    };

    this.characterizations.update(current =>
      current.map(c => {
        if (c.id === char.id) {
          return {
            ...c,
            executions: [...c.executions, newExecution],
          };
        }
        return c;
      })
    );
    this.applyFilter();
    this.snackBar.open(`Started generation for "${char.name}"`, 'OK', { duration: 3000 });

    // Simulate completion after 3 seconds
    setTimeout(() => {
      this.characterizations.update(current =>
        current.map(c => {
          if (c.id === char.id) {
            const updatedExecutions = c.executions.map(e => {
              if (e.status === 'RUNNING' && e.sourceKey === newExecution.sourceKey) {
                return {
                  ...e,
                  status: 'COMPLETE' as const,
                  endTime: new Date().toISOString(),
                  results: {
                    cohortCount: char.cohorts.length,
                    featuresAnalyzed: char.featureAnalyses.length * 10,
                    covariatesFound: Math.floor(Math.random() * 5000) + 1000,
                  },
                };
              }
              return e;
            });
            return { ...c, executions: updatedExecutions };
          }
          return c;
        })
      );
      this.applyFilter();
      this.snackBar.open(`Generation complete for "${char.name}"`, 'OK', { duration: 3000 });
    }, 3000);
  }

  viewResults(char: Characterization): void {
    const completedExecution = char.executions.find(e => e.status === 'COMPLETE');
    if (!completedExecution) {
      this.snackBar.open('No completed results available', 'OK', { duration: 2000 });
      return;
    }
    this.dialog.open(CharacterizationResultsDialogComponent, {
      data: { characterization: char, execution: completedExecution },
      width: '800px',
      maxHeight: '90vh',
    });
  }

  exportCharacterization(char: Characterization): void {
    // Create export JSON
    const exportData = {
      name: char.name,
      description: char.description,
      cohorts: char.cohorts,
      featureAnalyses: char.featureAnalyses,
      stratas: char.stratas,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo',
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characterization-${char.id}-${char.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported "${char.name}"`, 'OK', { duration: 3000 });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  getExecutionSummary(char: Characterization): string {
    if (char.executions.length === 0) return 'Not generated';

    const complete = char.executions.filter((e) => e.status === 'COMPLETE').length;
    const running = char.executions.filter((e) => e.status === 'RUNNING').length;
    const failed = char.executions.filter((e) => e.status === 'FAILED').length;

    const parts = [];
    if (complete > 0) parts.push(`${complete} complete`);
    if (running > 0) parts.push(`${running} running`);
    if (failed > 0) parts.push(`${failed} failed`);

    return parts.join(', ');
  }

  getExecutionStatusClass(char: Characterization): string {
    if (char.executions.length === 0) return 'status-none';
    if (char.executions.some((e) => e.status === 'RUNNING')) return 'status-running';
    if (char.executions.some((e) => e.status === 'FAILED')) return 'status-warning';
    if (char.executions.every((e) => e.status === 'COMPLETE')) return 'status-complete';
    return 'status-partial';
  }

  hasResults(char: Characterization): boolean {
    return char.executions.some((e) => e.status === 'COMPLETE' && e.results);
  }

  getCovariatesCount(char: Characterization): string {
    const completeExec = char.executions.find(
      (e) => e.status === 'COMPLETE' && e.results
    );
    if (completeExec?.results) {
      return `${completeExec.results.covariatesFound.toLocaleString()} covariates`;
    }
    return '';
  }

  getFeaturesSummary(char: Characterization): string {
    const preset = char.featureAnalyses.filter((f) => f.type === 'PRESET').length;
    const custom = char.featureAnalyses.filter((f) => f.type === 'CUSTOM').length;

    const parts = [];
    if (preset > 0) parts.push(`${preset} preset`);
    if (custom > 0) parts.push(`${custom} custom`);

    return parts.join(', ');
  }

  getTotalCount(): number {
    return this.characterizations().length;
  }

  getGeneratedCount(): number {
    return this.characterizations().filter((c) =>
      c.executions.some((e) => e.status === 'COMPLETE')
    ).length;
  }

  getRunningCount(): number {
    return this.characterizations().filter((c) =>
      c.executions.some((e) => e.status === 'RUNNING')
    ).length;
  }

  getTotalCohorts(): number {
    return this.characterizations().reduce((sum, c) => sum + c.cohorts.length, 0);
  }
}

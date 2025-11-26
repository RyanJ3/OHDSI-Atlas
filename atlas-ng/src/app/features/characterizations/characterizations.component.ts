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
    this.snackBar.open('Create new characterization (not implemented)', '', { duration: 2000 });
  }

  editCharacterization(char: Characterization): void {
    this.snackBar.open(`Opening "${char.name}" for editing...`, '', { duration: 2000 });
  }

  copyCharacterization(char: Characterization): void {
    this.snackBar.open(`Copying "${char.name}"...`, '', { duration: 2000 });
  }

  deleteCharacterization(char: Characterization): void {
    if (confirm(`Are you sure you want to delete "${char.name}"?`)) {
      this.snackBar.open(`Deleted "${char.name}"`, '', { duration: 2000 });
    }
  }

  generateCharacterization(char: Characterization): void {
    this.snackBar.open(`Generating characterization "${char.name}"...`, '', { duration: 2000 });
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
    this.snackBar.open(`Exporting "${char.name}"...`, '', { duration: 2000 });
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

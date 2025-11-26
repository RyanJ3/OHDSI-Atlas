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
import { GenerateDialogComponent } from './generate-dialog/generate-dialog.component';
import { ReportsDialogComponent } from './reports-dialog/reports-dialog.component';
import { CreateCohortDialogComponent } from './create-cohort-dialog/create-cohort-dialog.component';
import { EditCohortDialogComponent } from './edit-cohort-dialog/edit-cohort-dialog.component';

// Import mock data
import cohortDefinitionsData from '../../core/mock-data/cohort-definitions.json';

interface CohortDefinition {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
  expressionType: string;
  tags: string[];
  hasGeneration: boolean;
}

@Component({
  selector: 'app-cohort-definitions',
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
  templateUrl: './cohort-definitions.component.html',
  styleUrl: './cohort-definitions.component.scss',
})
export class CohortDefinitionsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(true);
  cohorts = signal<CohortDefinition[]>([]);
  filteredCohorts = signal<CohortDefinition[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'id',
    'name',
    'createdBy',
    'modifiedDate',
    'tags',
    'actions',
  ];

  ngOnInit(): void {
    this.loadCohorts();
  }

  private loadCohorts(): void {
    setTimeout(() => {
      const cohorts: CohortDefinition[] = (cohortDefinitionsData as any[]).map((c) => ({
        ...c,
        createdDate: new Date(c.createdDate),
        modifiedDate: new Date(c.modifiedDate),
        tags: c.tags || [],
        hasGeneration: c.hasGeneration || false,
      }));
      this.cohorts.set(cohorts);
      this.filteredCohorts.set(cohorts);
      this.totalResults.set(cohorts.length);
      this.loading.set(false);
    }, 400);
  }

  applyFilter(): void {
    const filter = this.searchFilter.toLowerCase().trim();
    if (!filter) {
      this.filteredCohorts.set(this.cohorts());
    } else {
      this.filteredCohorts.set(
        this.cohorts().filter(
          (c) =>
            c.name.toLowerCase().includes(filter) ||
            c.description.toLowerCase().includes(filter) ||
            c.createdBy.toLowerCase().includes(filter) ||
            c.tags.some((t) => t.toLowerCase().includes(filter))
        )
      );
    }
    this.totalResults.set(this.filteredCohorts().length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredCohorts()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredCohorts.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.id, b.id, isAsc);
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'createdBy':
            return this.compare(a.createdBy, b.createdBy, isAsc);
          case 'modifiedDate':
            return this.compare(
              a.modifiedDate.getTime(),
              b.modifiedDate.getTime(),
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

  createNew(): void {
    const dialogRef = this.dialog.open(CreateCohortDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: CohortDefinition | undefined) => {
      if (result) {
        this.cohorts.update(current => [result, ...current]);
        this.applyFilter();
        this.snackBar.open(`Created cohort "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editCohort(cohort: CohortDefinition): void {
    const dialogRef = this.dialog.open(EditCohortDialogComponent, {
      width: '700px',
      data: { cohort },
    });

    dialogRef.afterClosed().subscribe((result: CohortDefinition | undefined) => {
      if (result) {
        this.cohorts.update(current =>
          current.map(c => c.id === result.id ? result : c)
        );
        this.applyFilter();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  copyCohort(cohort: CohortDefinition): void {
    const copiedCohort: CohortDefinition = {
      ...cohort,
      id: Math.floor(Math.random() * 10000) + 1000,
      name: `${cohort.name} (Copy)`,
      createdDate: new Date(),
      modifiedDate: new Date(),
      createdBy: 'demo',
      hasGeneration: false,
    };
    this.cohorts.update(current => [copiedCohort, ...current]);
    this.applyFilter();
    this.snackBar.open(`Created copy of "${cohort.name}"`, 'Edit', { duration: 3000 })
      .onAction().subscribe(() => {
        this.editCohort(copiedCohort);
      });
  }

  exportCohort(cohort: CohortDefinition): void {
    // Create JSON export
    const exportData = {
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      expressionType: cohort.expressionType,
      tags: cohort.tags,
      expression: {
        ConceptSets: [],
        PrimaryCriteria: {},
        AdditionalCriteria: {},
        QualifiedLimit: {},
        ExpressionLimit: {},
        InclusionRules: [],
        CensoringCriteria: [],
        CollapseSettings: {},
        CensorWindow: {},
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort_${cohort.id}_${cohort.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.snackBar.open(`Exported "${cohort.name}"`, 'OK', { duration: 3000 });
  }

  deleteCohort(cohort: CohortDefinition): void {
    // Remove from list
    this.cohorts.update(current => current.filter(c => c.id !== cohort.id));
    this.applyFilter();

    // Show undo option
    const snackBarRef = this.snackBar.open(`Deleted "${cohort.name}"`, 'Undo', { duration: 5000 });
    snackBarRef.onAction().subscribe(() => {
      // Restore if undo clicked
      this.cohorts.update(current => [cohort, ...current]);
      this.applyFilter();
    });
  }

  generateCohort(cohort: CohortDefinition): void {
    const dialogRef = this.dialog.open(GenerateDialogComponent, {
      width: '600px',
      data: {
        cohortId: cohort.id,
        cohortName: cohort.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.length > 0) {
        this.snackBar.open(
          `Generated cohort on ${result.length} source(s)`,
          'View Results',
          { duration: 5000 }
        ).onAction().subscribe(() => {
          this.viewResults(cohort);
        });

        // Update hasGeneration flag
        this.cohorts.update((cohorts) =>
          cohorts.map((c) =>
            c.id === cohort.id ? { ...c, hasGeneration: true } : c
          )
        );
        this.applyFilter();
      }
    });
  }

  viewResults(cohort: CohortDefinition): void {
    this.router.navigate(['/cohortdefinitions', cohort.id, 'results']);
  }

  viewReports(cohort: CohortDefinition): void {
    this.dialog.open(ReportsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        cohortId: cohort.id,
        cohortName: cohort.name,
      },
    });
  }
}

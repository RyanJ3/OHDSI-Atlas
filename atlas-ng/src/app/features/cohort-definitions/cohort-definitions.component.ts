import { Component, OnInit, signal } from '@angular/core';
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
  ],
  templateUrl: './cohort-definitions.component.html',
  styleUrl: './cohort-definitions.component.scss',
})
export class CohortDefinitionsComponent implements OnInit {
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
      const cohorts = this.getMockCohorts();
      this.cohorts.set(cohorts);
      this.filteredCohorts.set(cohorts);
      this.totalResults.set(cohorts.length);
      this.loading.set(false);
    }, 600);
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
    console.log('Create new cohort');
  }

  editCohort(cohort: CohortDefinition): void {
    console.log('Edit cohort:', cohort);
  }

  copyCohort(cohort: CohortDefinition): void {
    console.log('Copy cohort:', cohort);
  }

  deleteCohort(cohort: CohortDefinition): void {
    console.log('Delete cohort:', cohort);
  }

  generateCohort(cohort: CohortDefinition): void {
    console.log('Generate cohort:', cohort);
  }

  private getMockCohorts(): CohortDefinition[] {
    return [
      {
        id: 1,
        name: 'Type 2 Diabetes Mellitus',
        description: 'Patients with T2DM diagnosis',
        createdBy: 'admin',
        createdDate: new Date('2024-01-15'),
        modifiedDate: new Date('2024-03-20'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['diabetes', 'chronic'],
        hasGeneration: true,
      },
      {
        id: 2,
        name: 'Hypertension - First Diagnosis',
        description: 'First occurrence of hypertension',
        createdBy: 'researcher1',
        createdDate: new Date('2024-02-10'),
        modifiedDate: new Date('2024-03-15'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['cardiovascular'],
        hasGeneration: true,
      },
      {
        id: 3,
        name: 'COVID-19 Hospitalization',
        description: 'COVID-19 patients requiring hospitalization',
        createdBy: 'admin',
        createdDate: new Date('2024-01-05'),
        modifiedDate: new Date('2024-02-28'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['infectious', 'covid'],
        hasGeneration: false,
      },
      {
        id: 4,
        name: 'Metformin New Users',
        description: 'First-time metformin users with 365-day washout',
        createdBy: 'researcher2',
        createdDate: new Date('2024-03-01'),
        modifiedDate: new Date('2024-03-25'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['drug', 'diabetes'],
        hasGeneration: true,
      },
      {
        id: 5,
        name: 'Chronic Kidney Disease Stage 3+',
        description: 'CKD patients at stage 3 or higher',
        createdBy: 'admin',
        createdDate: new Date('2024-02-20'),
        modifiedDate: new Date('2024-03-10'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['renal', 'chronic'],
        hasGeneration: true,
      },
      {
        id: 6,
        name: 'Heart Failure - Reduced EF',
        description: 'Heart failure with reduced ejection fraction',
        createdBy: 'researcher1',
        createdDate: new Date('2024-01-25'),
        modifiedDate: new Date('2024-03-05'),
        expressionType: 'SIMPLE_EXPRESSION',
        tags: ['cardiovascular', 'heart failure'],
        hasGeneration: false,
      },
    ];
  }
}

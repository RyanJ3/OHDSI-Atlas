import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Concept {
  conceptId: number;
  conceptName: string;
  domainId: string;
  vocabularyId: string;
  conceptClassId: string;
  standardConcept: string;
  conceptCode: string;
  invalidReason: string | null;
}

interface Domain {
  id: string;
  name: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  selectedDomain = '';
  standardOnly = true;

  loading = signal(false);
  concepts = signal<Concept[]>([]);
  totalResults = signal(0);
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'conceptId',
    'conceptName',
    'domainId',
    'vocabularyId',
    'conceptClassId',
    'standardConcept',
    'actions',
  ];

  domains: Domain[] = [
    { id: '', name: 'All Domains' },
    { id: 'Condition', name: 'Condition' },
    { id: 'Drug', name: 'Drug' },
    { id: 'Procedure', name: 'Procedure' },
    { id: 'Measurement', name: 'Measurement' },
    { id: 'Observation', name: 'Observation' },
    { id: 'Device', name: 'Device' },
    { id: 'Visit', name: 'Visit' },
    { id: 'Specimen', name: 'Specimen' },
  ];

  ngOnInit(): void {
    // Initial empty state
  }

  search(): void {
    if (!this.searchQuery.trim()) return;

    this.loading.set(true);
    this.pageIndex = 0;

    // Simulate API call
    setTimeout(() => {
      this.concepts.set(this.getMockResults());
      this.totalResults.set(127);
      this.loading.set(false);
    }, 600);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.search();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.concepts.set([]);
    this.totalResults.set(0);
  }

  addToConceptSet(concept: Concept): void {
    console.log('Add to concept set:', concept);
    // Would dispatch action to add to concept set
  }

  viewConceptDetails(concept: Concept): void {
    console.log('View concept:', concept);
    // Would navigate to concept detail page
  }

  getStandardBadgeClass(standardConcept: string): string {
    switch (standardConcept) {
      case 'S':
        return 'standard';
      case 'C':
        return 'classification';
      default:
        return 'non-standard';
    }
  }

  getStandardLabel(standardConcept: string): string {
    switch (standardConcept) {
      case 'S':
        return 'Standard';
      case 'C':
        return 'Classification';
      default:
        return 'Non-standard';
    }
  }

  private getMockResults(): Concept[] {
    return [
      {
        conceptId: 201826,
        conceptName: 'Type 2 diabetes mellitus',
        domainId: 'Condition',
        vocabularyId: 'SNOMED',
        conceptClassId: 'Clinical Finding',
        standardConcept: 'S',
        conceptCode: '44054006',
        invalidReason: null,
      },
      {
        conceptId: 443238,
        conceptName: 'Diabetic nephropathy',
        domainId: 'Condition',
        vocabularyId: 'SNOMED',
        conceptClassId: 'Clinical Finding',
        standardConcept: 'S',
        conceptCode: '127013003',
        invalidReason: null,
      },
      {
        conceptId: 377821,
        conceptName: 'Diabetes mellitus type 2 without complication',
        domainId: 'Condition',
        vocabularyId: 'SNOMED',
        conceptClassId: 'Clinical Finding',
        standardConcept: 'S',
        conceptCode: '359642000',
        invalidReason: null,
      },
      {
        conceptId: 4193704,
        conceptName: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
        domainId: 'Condition',
        vocabularyId: 'SNOMED',
        conceptClassId: 'Clinical Finding',
        standardConcept: 'S',
        conceptCode: '731000119105',
        invalidReason: null,
      },
      {
        conceptId: 1503297,
        conceptName: 'Metformin',
        domainId: 'Drug',
        vocabularyId: 'RxNorm',
        conceptClassId: 'Ingredient',
        standardConcept: 'S',
        conceptCode: '6809',
        invalidReason: null,
      },
      {
        conceptId: 1529331,
        conceptName: 'Insulin glargine',
        domainId: 'Drug',
        vocabularyId: 'RxNorm',
        conceptClassId: 'Ingredient',
        standardConcept: 'S',
        conceptCode: '274783',
        invalidReason: null,
      },
      {
        conceptId: 3004410,
        conceptName: 'Hemoglobin A1c/Hemoglobin.total in Blood',
        domainId: 'Measurement',
        vocabularyId: 'LOINC',
        conceptClassId: 'Lab Test',
        standardConcept: 'S',
        conceptCode: '4548-4',
        invalidReason: null,
      },
      {
        conceptId: 3034639,
        conceptName: 'Glucose [Mass/volume] in Blood',
        domainId: 'Measurement',
        vocabularyId: 'LOINC',
        conceptClassId: 'Lab Test',
        standardConcept: 'S',
        conceptCode: '2339-0',
        invalidReason: null,
      },
    ];
  }
}

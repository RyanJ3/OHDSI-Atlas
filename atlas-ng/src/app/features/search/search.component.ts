import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  VocabularyService,
  Concept as ApiConcept,
} from '../../core/services/vocabulary.service';
import { SourceService, Source } from '../../core/services/source.service';
import { catchError, of } from 'rxjs';

// Import mock data for fallback
import conceptsData from '../../core/mock-data/concepts.json';
import sourcesData from '../../core/mock-data/sources.json';

interface DisplayConcept {
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
    MatSnackBarModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private vocabularyService = inject(VocabularyService);
  private sourceService = inject(SourceService);
  private snackBar = inject(MatSnackBar);

  searchQuery = '';
  selectedDomain = '';
  selectedSource = '';
  standardOnly = true;

  loading = signal(false);
  loadingSources = signal(true);
  concepts = signal<DisplayConcept[]>([]);
  totalResults = signal(0);
  sources = signal<Source[]>([]);
  error = signal<string | null>(null);

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
    this.loadSources();
  }

  private loadSources(): void {
    this.loadingSources.set(true);

    this.sourceService
      .getSources()
      .pipe(
        catchError((err) => {
          console.error('Failed to load sources, using mock data:', err);
          // Fallback to mock sources data
          return of(sourcesData as Source[]);
        })
      )
      .subscribe((sources) => {
        // If API returned empty, use mock data
        if (sources.length === 0) {
          sources = sourcesData as Source[];
        }

        // Filter to sources with vocabulary
        const vocabSources = sources.filter((s) =>
          s.daimons?.some(
            (d) => d.daimonType === 'Vocabulary' || d.daimonType === 'CDM'
          )
        );
        this.sources.set(vocabSources);

        // Auto-select first source if available
        if (vocabSources.length > 0 && !this.selectedSource) {
          this.selectedSource = vocabSources[0].sourceKey;
        }

        this.loadingSources.set(false);
      });
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    if (!this.selectedSource) {
      this.snackBar.open('Please select a data source', 'OK', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.pageIndex = 0;

    const searchParams: any = {
      QUERY: this.searchQuery,
    };

    if (this.selectedDomain) {
      searchParams.DOMAIN_ID = [this.selectedDomain];
    }

    if (this.standardOnly) {
      searchParams.STANDARD_CONCEPT = 'S';
    }

    this.vocabularyService
      .search(searchParams, this.selectedSource)
      .pipe(
        catchError((err) => {
          console.error('Search failed, using mock data:', err);
          // Fallback to mock concepts data with client-side filtering
          return of(this.filterMockConcepts());
        })
      )
      .subscribe((results) => {
        const displayConcepts = this.mapToDisplayConcepts(results);
        this.concepts.set(displayConcepts);
        this.totalResults.set(displayConcepts.length);
        this.loading.set(false);

        if (displayConcepts.length === 0 && !this.error()) {
          this.snackBar.open('No concepts found matching your search', 'OK', {
            duration: 3000,
          });
        }
      });
  }

  private filterMockConcepts(): ApiConcept[] {
    const query = this.searchQuery.toLowerCase();
    let filtered = (conceptsData as unknown as ApiConcept[]).filter(c =>
      c.CONCEPT_NAME.toLowerCase().includes(query) ||
      c.CONCEPT_CODE.toLowerCase().includes(query)
    );

    if (this.selectedDomain) {
      filtered = filtered.filter(c => c.DOMAIN_ID === this.selectedDomain);
    }

    if (this.standardOnly) {
      filtered = filtered.filter(c => c.STANDARD_CONCEPT === 'S');
    }

    return filtered;
  }

  private mapToDisplayConcepts(apiConcepts: ApiConcept[]): DisplayConcept[] {
    return apiConcepts.map((c) => ({
      conceptId: c.CONCEPT_ID,
      conceptName: c.CONCEPT_NAME,
      domainId: c.DOMAIN_ID,
      vocabularyId: c.VOCABULARY_ID,
      conceptClassId: c.CONCEPT_CLASS_ID,
      standardConcept: c.STANDARD_CONCEPT,
      conceptCode: c.CONCEPT_CODE,
      invalidReason: c.INVALID_REASON,
    }));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.concepts.set([]);
    this.totalResults.set(0);
    this.error.set(null);
  }

  addToConceptSet(concept: DisplayConcept): void {
    this.snackBar.open(`Added "${concept.conceptName}" to concept set`, 'OK', {
      duration: 2000,
    });
  }

  viewConceptDetails(concept: DisplayConcept): void {
    window.open(`#/concept/${concept.conceptId}`, '_blank');
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

  getPaginatedConcepts(): DisplayConcept[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.concepts().slice(start, end);
  }
}

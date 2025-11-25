import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config';

export interface Concept {
  CONCEPT_ID: number;
  CONCEPT_NAME: string;
  DOMAIN_ID: string;
  VOCABULARY_ID: string;
  CONCEPT_CLASS_ID: string;
  STANDARD_CONCEPT: string;
  CONCEPT_CODE: string;
  VALID_START_DATE: string;
  VALID_END_DATE: string;
  INVALID_REASON: string;

  // Additional properties from record counts
  RECORD_COUNT?: number;
  DESCENDANT_RECORD_COUNT?: number;
  PERSON_COUNT?: number;
  DESCENDANT_PERSON_COUNT?: number;
}

export interface ConceptSearchParams {
  QUERY?: string;
  DOMAIN_ID?: string[];
  VOCABULARY_ID?: string[];
  CONCEPT_CLASS_ID?: string[];
  STANDARD_CONCEPT?: string;
  INVALID_REASON?: string;
}

export interface ConceptSetItem {
  concept: Concept;
  isExcluded: boolean;
  includeDescendants: boolean;
  includeMapped: boolean;
}

export interface ConceptSet {
  id: number;
  name: string;
  description?: string;
  expression: {
    items: ConceptSetItem[];
  };
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface Domain {
  DOMAIN_ID: string;
  DOMAIN_NAME: string;
  DOMAIN_CONCEPT_ID: number;
}

@Injectable({
  providedIn: 'root',
})
export class VocabularyService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private vocabularyUrl: string | null = null;

  /**
   * Set the vocabulary URL for a specific source
   */
  setVocabularyUrl(url: string): void {
    this.vocabularyUrl = url;
  }

  /**
   * Get the current vocabulary URL
   */
  getVocabularyUrl(sourceKey?: string): string {
    if (sourceKey) {
      return `${this.config.webApiUrl}vocabulary/${sourceKey}/`;
    }
    return this.vocabularyUrl || `${this.config.webApiUrl}vocabulary/`;
  }

  /**
   * Search for concepts
   */
  search(params: ConceptSearchParams, sourceKey?: string): Observable<Concept[]> {
    const url = this.getVocabularyUrl(sourceKey);

    // Simple search via GET if only QUERY is provided
    if (params.QUERY && Object.keys(params).length === 1) {
      const encodedQuery = this.encodeQuery(params.QUERY);
      return this.http
        .get<Concept[]>(`${url}search?query=${encodedQuery}`);
    }

    // Advanced search via POST
    return this.http.post<Concept[]>(`${url}search`, params);
  }

  /**
   * Get a single concept by ID
   */
  getConcept(conceptId: number, sourceKey?: string): Observable<Concept> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.get<Concept>(`${url}concept/${conceptId}`);
  }

  /**
   * Get concepts by IDs
   */
  getConceptsById(
    identifiers: number[],
    sourceKey?: string
  ): Observable<Concept[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http
      .post<Concept[]>(`${url}lookup/identifiers`, identifiers);
  }

  /**
   * Get concepts by source codes
   */
  getConceptsByCode(codes: string[], sourceKey?: string): Observable<Concept[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http
      .post<Concept[]>(`${url}lookup/sourcecodes`, codes);
  }

  /**
   * Get mapped concepts by IDs
   */
  getMappedConceptsById(
    identifiers: number[],
    sourceKey?: string
  ): Observable<Concept[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.post<Concept[]>(`${url}lookup/mapped`, identifiers);
  }

  /**
   * Get recommended concepts by IDs
   */
  getRecommendedConceptsById(
    identifiers: number[],
    sourceKey?: string
  ): Observable<Concept[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http
      .post<Concept[]>(`${url}lookup/recommended`, identifiers);
  }

  /**
   * Get all domains
   */
  getDomains(sourceKey?: string): Observable<Domain[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.get<Domain[]>(`${url}domains`);
  }

  /**
   * Resolve a concept set expression to concept IDs
   */
  resolveConceptSetExpression(
    expression: ConceptSetItem[],
    sourceKey?: string
  ): Observable<number[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http
      .post<number[]>(`${url}resolveConceptSetExpression`, expression);
  }

  /**
   * Get SQL for a concept set expression
   */
  getConceptSetExpressionSQL(
    expression: ConceptSetItem[]
  ): Observable<string> {
    return this.http.post(
      `${this.config.webApiUrl}vocabulary/conceptSetExpressionSQL`,
      expression,
      { responseType: 'text' }
    );
  }

  /**
   * Optimize a concept set
   */
  optimizeConceptSet(
    conceptSetItems: ConceptSetItem[],
    sourceKey?: string
  ): Observable<ConceptSetItem[]> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.post<ConceptSetItem[]>(`${url}optimize`, conceptSetItems);
  }

  /**
   * Compare concept sets
   */
  compareConceptSets(
    compareTargets: any[],
    sourceKey?: string
  ): Observable<any> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.post(`${url}compare`, compareTargets);
  }

  /**
   * Load ancestors for concepts
   */
  loadAncestors(
    ancestors: number[],
    descendants: number[],
    sourceKey?: string
  ): Observable<any> {
    const url = this.getVocabularyUrl(sourceKey);
    return this.http.post(`${url}lookup/identifiers/ancestors`, {
      ancestors,
      descendants,
    });
  }

  /**
   * Encode query string for URL
   */
  private encodeQuery(str: string): string {
    str = encodeURIComponent(str);
    str = str.replace(/\*/g, '%2A'); // handle asterisk for wildcard search
    return str;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from '../config';

export enum DaimonType {
  CDM = 'CDM',
  Vocabulary = 'Vocabulary',
  Results = 'Results',
  CEM = 'CEM',
  CEMResults = 'CEMResults',
  Temp = 'Temp',
}

export interface Daimon {
  daimonType: DaimonType;
  tableQualifier: string;
  priority: number;
}

export interface Source {
  sourceId: number;
  sourceName: string;
  sourceDialect: string;
  sourceConnection: string;
  sourceKey: string;
  daimons: Daimon[];

  // Computed properties
  hasVocabulary?: boolean;
  hasEvidence?: boolean;
  hasResults?: boolean;
  hasCEMResults?: boolean;
  hasCDM?: boolean;
  vocabularyUrl?: string;
  evidenceUrl?: string;
  resultsUrl?: string;
  version?: string;
  dialect?: string;
}

export interface PriorityDaimon {
  sourceKey: string;
  daimonType: DaimonType;
}

export type PriorityDaimons = Record<string, PriorityDaimon>;

export interface VocabularyInfo {
  version: string;
  dialect: string;
}

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  /**
   * Get all sources
   */
  getSources(): Observable<Source[]> {
    return this.http.get<Source[]>(`${this.config.webApiUrl}source/sources`);
  }

  /**
   * Get daimon priorities
   */
  getDaimonPriorities(): Observable<PriorityDaimons> {
    return this.http.get<PriorityDaimons>(
      `${this.config.webApiUrl}source/daimon/priority`
    );
  }

  /**
   * Get a single source by key
   */
  getSource(sourceKey: string): Observable<Source> {
    return this.http.get<Source>(
      `${this.config.webApiUrl}source/details/${sourceKey}`
    );
  }

  /**
   * Save or update a source
   */
  saveSource(source: Source, keyfile?: File): Observable<Source> {
    const formData = new FormData();

    if (keyfile) {
      formData.append('keyfile', keyfile);
    }

    formData.append(
      'source',
      new Blob([JSON.stringify(source)], { type: 'application/json' })
    );

    if (source.sourceId && source.sourceId !== 0) {
      return this.http.put<Source>(
        `${this.config.webApiUrl}source/${source.sourceKey}`,
        formData
      );
    } else {
      return this.http.post<Source>(
        `${this.config.webApiUrl}source/`,
        formData
      );
    }
  }

  /**
   * Delete a source
   */
  deleteSource(sourceKey: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.webApiUrl}source/${sourceKey}`
    );
  }

  /**
   * Check source connection
   */
  checkSourceConnection(
    sourceKey: string
  ): Observable<{ sourceId: number; sourceKey: string }> {
    return this.http.get<{ sourceId: number; sourceKey: string }>(
      `${this.config.webApiUrl}source/connection/${sourceKey}`
    );
  }

  /**
   * Refresh source cache
   */
  refreshSourceCache(sourceKey: string): Observable<any> {
    return this.http.get(
      `${this.config.webApiUrl}cdmresults/${sourceKey}/refreshCache`
    );
  }

  /**
   * Update source daimon priority
   */
  updateSourceDaimonPriority(
    sourceKey: string,
    daimonType: DaimonType
  ): Observable<any> {
    return this.http.post(
      `${this.config.webApiUrl}source/${sourceKey}/daimons/${daimonType}/set-priority`,
      {}
    );
  }

  /**
   * Get vocabulary info for a source
   */
  getVocabularyInfo(sourceKey: string): Observable<VocabularyInfo> {
    return this.http
      .get<VocabularyInfo>(
        `${this.config.webApiUrl}vocabulary/${sourceKey}/info`
      )
      .pipe(
        catchError(() =>
          of({ version: 'unknown', dialect: 'unknown' } as VocabularyInfo)
        )
      );
  }

  /**
   * Initialize sources with computed properties
   */
  initializeSources(): Observable<{
    sources: Source[];
    priorities: PriorityDaimons;
  }> {
    return forkJoin({
      sources: this.getSources(),
      priorities: this.getDaimonPriorities(),
    }).pipe(
      map(({ sources, priorities }) => {
        const enrichedSources = sources.map((source) =>
          this.enrichSource(source)
        );
        return { sources: enrichedSources, priorities };
      })
    );
  }

  /**
   * Enrich source with computed properties
   */
  private enrichSource(source: Source): Source {
    const enriched: Source = {
      ...source,
      hasVocabulary: false,
      hasEvidence: false,
      hasResults: false,
      hasCEMResults: false,
      hasCDM: false,
      vocabularyUrl: '',
      evidenceUrl: '',
      resultsUrl: '',
    };

    source.daimons?.forEach((daimon) => {
      switch (daimon.daimonType) {
        case DaimonType.Vocabulary:
          enriched.hasVocabulary = true;
          enriched.vocabularyUrl = this.getVocabularyUrl(source.sourceKey);
          break;
        case DaimonType.CEM:
          enriched.hasEvidence = true;
          enriched.evidenceUrl = this.getEvidenceUrl(source.sourceKey);
          break;
        case DaimonType.CEMResults:
          enriched.hasCEMResults = true;
          break;
        case DaimonType.Results:
          enriched.hasResults = true;
          enriched.resultsUrl = this.getResultsUrl(source.sourceKey);
          break;
        case DaimonType.CDM:
          enriched.hasCDM = true;
          break;
      }
    });

    // If no vocabulary daimon but has CDM, vocabulary is available
    if (!enriched.hasVocabulary && enriched.hasCDM) {
      enriched.hasVocabulary = true;
      enriched.vocabularyUrl = this.getVocabularyUrl(source.sourceKey);
    }

    return enriched;
  }

  getVocabularyUrl(sourceKey: string): string {
    return `${this.config.webApiUrl}vocabulary/${sourceKey}/`;
  }

  getEvidenceUrl(sourceKey: string): string {
    return `${this.config.webApiUrl}evidence/${sourceKey}/`;
  }

  getResultsUrl(sourceKey: string): string {
    return `${this.config.webApiUrl}cdmresults/${sourceKey}/`;
  }
}

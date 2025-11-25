import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config';

export interface CohortDefinitionListItem {
  id: number;
  name: string;
  description?: string;
  expressionType?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface CohortDefinition extends CohortDefinitionListItem {
  expression: any; // Circe cohort expression
  tags?: any[];
}

export interface CohortGenerationInfo {
  id: {
    cohortDefinitionId: number;
    sourceId: number;
  };
  status: string;
  startTime: number;
  executionDuration?: number;
  personCount?: number;
  recordCount?: number;
  failMessage?: string;
  isValid: boolean;
  isCanceled: boolean;
}

export interface CohortReport {
  summary: any;
  treemapData?: any;
  prevalenceByMonth?: any[];
  prevalenceByYear?: any[];
  prevalenceByGenderAgeYear?: any[];
}

export interface SqlOptions {
  cdmSchema?: string;
  targetSchema?: string;
  resultSchema?: string;
  vocabularySchema?: string;
  targetTable?: string;
  generateStats?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CohortDefinitionService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  /**
   * Get list of all cohort definitions
   */
  getCohortDefinitionList(): Observable<CohortDefinitionListItem[]> {
    return this.http.get<CohortDefinitionListItem[]>(
      `${this.config.webApiUrl}cohortdefinition/`
    );
  }

  /**
   * Get a single cohort definition by ID
   */
  getCohortDefinition(id: number): Observable<CohortDefinition> {
    return this.http
      .get<any>(`${this.config.webApiUrl}cohortdefinition/${id}`)
      .pipe(
        map((cohort) => ({
          ...cohort,
          expression:
            typeof cohort.expression === 'string'
              ? JSON.parse(cohort.expression)
              : cohort.expression,
        }))
      );
  }

  /**
   * Save (create or update) a cohort definition
   */
  saveCohortDefinition(
    definition: CohortDefinition
  ): Observable<CohortDefinition> {
    const payload = {
      ...definition,
      expression:
        typeof definition.expression === 'string'
          ? definition.expression
          : JSON.stringify(definition.expression),
    };

    if (definition.id) {
      return this.http.put<CohortDefinition>(
        `${this.config.webApiUrl}cohortdefinition/${definition.id}`,
        payload
      );
    } else {
      return this.http.post<CohortDefinition>(
        `${this.config.webApiUrl}cohortdefinition/`,
        payload
      );
    }
  }

  /**
   * Copy a cohort definition
   */
  copyCohortDefinition(id: number): Observable<CohortDefinition> {
    return this.http.get<CohortDefinition>(
      `${this.config.webApiUrl}cohortdefinition/${id}/copy`
    );
  }

  /**
   * Delete a cohort definition
   */
  deleteCohortDefinition(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.config.webApiUrl}cohortdefinition/${id}`
    );
  }

  /**
   * Check if a cohort definition name already exists
   */
  nameExists(name: string, excludeId?: number): Observable<boolean> {
    const id = excludeId || 0;
    return this.http.get<boolean>(
      `${this.config.webApiUrl}cohortdefinition/${id}/exists?name=${encodeURIComponent(name)}`
    );
  }

  /**
   * Get SQL for a cohort expression
   */
  getSql(expression: any, options?: SqlOptions): Observable<{ templateSql: string }> {
    return this.http.post<{ templateSql: string }>(
      `${this.config.webApiUrl}cohortdefinition/sql`,
      { expression, options }
    );
  }

  /**
   * Translate SQL to a specific dialect
   */
  translateSql(
    sql: string,
    targetDialect: string
  ): Observable<{ targetSQL: string }> {
    return this.http.post<{ targetSQL: string }>(
      `${this.config.webApiUrl}sqlrender/translate`,
      { SQL: sql, targetdialect: targetDialect }
    );
  }

  /**
   * Generate a cohort on a data source
   */
  generate(cohortDefinitionId: number, sourceKey: string): Observable<any> {
    return this.http.get(
      `${this.config.webApiUrl}cohortdefinition/${cohortDefinitionId}/generate/${sourceKey}`
    );
  }

  /**
   * Cancel cohort generation
   */
  cancelGeneration(
    cohortDefinitionId: number,
    sourceKey: string
  ): Observable<any> {
    return this.http.get(
      `${this.config.webApiUrl}cohortdefinition/${cohortDefinitionId}/cancel/${sourceKey}`
    );
  }

  /**
   * Get generation info for all sources
   */
  getGenerationInfo(cohortDefinitionId: number): Observable<CohortGenerationInfo[]> {
    return this.http.get<CohortGenerationInfo[]>(
      `${this.config.webApiUrl}cohortdefinition/${cohortDefinitionId}/info`
    );
  }

  /**
   * Get cohort report for a source
   */
  getReport(
    cohortDefinitionId: number,
    sourceKey: string,
    modeId = 0
  ): Observable<CohortReport> {
    return this.http.get<CohortReport>(
      `${this.config.webApiUrl}cohortdefinition/${cohortDefinitionId}/report/${sourceKey}?mode=${modeId}`
    );
  }

  /**
   * Run diagnostics on a cohort expression
   */
  runDiagnostics(expression: any): Observable<any> {
    return this.http.post(
      `${this.config.webApiUrl}cohortdefinition/checkV2`,
      expression
    );
  }

  /**
   * Get distinct person count for a cohort
   */
  getCohortCount(
    sourceKey: string,
    cohortDefinitionId: number
  ): Observable<number> {
    return this.http.get<number>(
      `${this.config.webApiUrl}cohortresults/${sourceKey}/${cohortDefinitionId}/distinctPersonCount`
    );
  }
}

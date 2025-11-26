import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

interface OutcomeResult {
  outcome: string;
  targetSubjects: number;
  comparatorSubjects: number;
  targetOutcomes: number;
  comparatorOutcomes: number;
  hazardRatio: number;
  ciLower: number;
  ciUpper: number;
  pValue: number;
}

interface EstimationResult {
  sourceName: string;
  executionDate: string;
  targetCohortCount: number;
  comparatorCohortCount: number;
  outcomes: OutcomeResult[];
}

@Component({
  selector: 'app-estimation-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <i class="fas fa-chart-bar"></i>
      Estimation Results
    </h2>

    <mat-dialog-content>
      <!-- Study Info -->
      <div class="study-info">
        <h3>{{ data.estimation.name }}</h3>
        <p class="description">{{ data.estimation.description }}</p>
        <div class="comparison-info">
          <mat-chip-set>
            <mat-chip class="target-chip">
              <i class="fas fa-users"></i>
              Target: {{ data.estimation.comparisons[0].targetCohort }}
            </mat-chip>
            <mat-chip class="comparator-chip">
              <i class="fas fa-users"></i>
              Comparator: {{ data.estimation.comparisons[0].comparatorCohort }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Execution Info -->
      <div class="execution-info">
        <div class="info-item">
          <span class="label">Data Source:</span>
          <span class="value">{{ result.sourceName }}</span>
        </div>
        <div class="info-item">
          <span class="label">Execution Date:</span>
          <span class="value">{{ result.executionDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">Target Cohort:</span>
          <span class="value">{{ result.targetCohortCount | number }} subjects</span>
        </div>
        <div class="info-item">
          <span class="label">Comparator Cohort:</span>
          <span class="value">{{ result.comparatorCohortCount | number }} subjects</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Results Table -->
      <h4>Outcome Results</h4>
      <table mat-table [dataSource]="result.outcomes" class="results-table">
        <ng-container matColumnDef="outcome">
          <th mat-header-cell *matHeaderCellDef>Outcome</th>
          <td mat-cell *matCellDef="let row">
            <strong>{{ row.outcome }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="targetEvents">
          <th mat-header-cell *matHeaderCellDef>Target Events</th>
          <td mat-cell *matCellDef="let row">
            {{ row.targetOutcomes }} / {{ row.targetSubjects | number }}
            <span class="rate">({{ (row.targetOutcomes / row.targetSubjects * 100).toFixed(2) }}%)</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="comparatorEvents">
          <th mat-header-cell *matHeaderCellDef>Comparator Events</th>
          <td mat-cell *matCellDef="let row">
            {{ row.comparatorOutcomes }} / {{ row.comparatorSubjects | number }}
            <span class="rate">({{ (row.comparatorOutcomes / row.comparatorSubjects * 100).toFixed(2) }}%)</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="hazardRatio">
          <th mat-header-cell *matHeaderCellDef>Hazard Ratio (95% CI)</th>
          <td mat-cell *matCellDef="let row">
            <span class="hr-value" [ngClass]="getHRClass(row.hazardRatio, row.ciLower, row.ciUpper)">
              {{ row.hazardRatio.toFixed(2) }}
            </span>
            <span class="ci">({{ row.ciLower.toFixed(2) }} - {{ row.ciUpper.toFixed(2) }})</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="pValue">
          <th mat-header-cell *matHeaderCellDef>P-value</th>
          <td mat-cell *matCellDef="let row">
            <span [ngClass]="{'significant': row.pValue < 0.05}">
              {{ row.pValue < 0.001 ? '< 0.001' : row.pValue.toFixed(3) }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="forest">
          <th mat-header-cell *matHeaderCellDef>Forest Plot</th>
          <td mat-cell *matCellDef="let row">
            <div class="mini-forest">
              <div class="forest-line"></div>
              <div class="forest-ref"></div>
              <div
                class="forest-point"
                [style.left.%]="getForestPosition(row.hazardRatio)"
                [matTooltip]="'HR: ' + row.hazardRatio.toFixed(2)"
              ></div>
              <div
                class="forest-ci"
                [style.left.%]="getForestPosition(row.ciLower)"
                [style.width.%]="getForestPosition(row.ciUpper) - getForestPosition(row.ciLower)"
              ></div>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <!-- Legend -->
      <div class="legend">
        <span class="legend-item">
          <span class="dot protective"></span> HR &lt; 1 (favors target)
        </span>
        <span class="legend-item">
          <span class="dot neutral"></span> HR ≈ 1 (no difference)
        </span>
        <span class="legend-item">
          <span class="dot harmful"></span> HR &gt; 1 (favors comparator)
        </span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [matMenuTriggerFor]="exportMenu">
        <i class="fas fa-download"></i>
        Export
        <i class="fas fa-caret-down" style="margin-left: 4px;"></i>
      </button>
      <mat-menu #exportMenu="matMenu">
        <button mat-menu-item (click)="exportResults()">
          <i class="fas fa-file-csv"></i>
          Export as CSV
        </button>
        <button mat-menu-item (click)="exportJSON()">
          <i class="fas fa-file-code"></i>
          Export as JSON
        </button>
      </mat-menu>
      <button mat-raised-button color="primary" mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;

      i {
        color: #7b1fa2;
      }
    }

    mat-dialog-content {
      min-width: 800px;
      max-height: 70vh;
    }

    .study-info {
      padding: 16px 0;

      h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .description {
        color: #666;
        font-size: 14px;
        margin: 0 0 12px 0;
      }

      .comparison-info {
        margin-top: 12px;
      }

      .target-chip {
        background: #e3f2fd !important;
        color: #1565c0 !important;
      }

      .comparator-chip {
        background: #fce4ec !important;
        color: #c2185b !important;
      }

      mat-chip i {
        margin-right: 6px;
      }
    }

    .execution-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px 0;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label {
          font-size: 12px;
          color: #888;
        }

        .value {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      }
    }

    h4 {
      margin: 16px 0 12px 0;
      color: #333;
    }

    .results-table {
      width: 100%;

      th {
        background: #fafafa;
        font-weight: 600;
        font-size: 12px;
      }

      td {
        font-size: 13px;
      }

      .rate {
        font-size: 11px;
        color: #888;
        margin-left: 4px;
      }

      .hr-value {
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;

        &.protective {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.harmful {
          background: #ffebee;
          color: #c62828;
        }

        &.neutral {
          background: #f5f5f5;
          color: #666;
        }
      }

      .ci {
        font-size: 11px;
        color: #666;
        margin-left: 4px;
      }

      .significant {
        font-weight: 600;
        color: #1565c0;
      }
    }

    .mini-forest {
      width: 100px;
      height: 20px;
      position: relative;
      background: #f5f5f5;
      border-radius: 2px;

      .forest-line {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #ccc;
      }

      .forest-ref {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 1px;
        background: #333;
      }

      .forest-point {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: #1976d2;
        border-radius: 50%;
        z-index: 2;
      }

      .forest-ci {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 4px;
        background: rgba(25, 118, 210, 0.3);
        border-radius: 2px;
      }
    }

    .legend {
      display: flex;
      gap: 20px;
      margin-top: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;
      font-size: 12px;
      color: #666;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;

        &.protective {
          background: #4caf50;
        }

        &.neutral {
          background: #9e9e9e;
        }

        &.harmful {
          background: #f44336;
        }
      }
    }

    mat-dialog-actions button i {
      margin-right: 6px;
    }
  `],
})
export class EstimationResultsDialogComponent {
  displayedColumns = ['outcome', 'targetEvents', 'comparatorEvents', 'hazardRatio', 'pValue', 'forest'];

  // Mock results data
  result: EstimationResult;

  constructor(
    public dialogRef: MatDialogRef<EstimationResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estimation: any }
  ) {
    // Generate mock results based on the estimation's outcomes
    this.result = this.generateMockResults();
  }

  private generateMockResults(): EstimationResult {
    const outcomes = this.data.estimation.comparisons[0]?.outcomes || [];
    const executionDate = this.data.estimation.latestExecution?.date
      ? new Date(this.data.estimation.latestExecution.date).toLocaleDateString()
      : 'N/A';

    return {
      sourceName: this.data.estimation.latestExecution?.sourceName || 'Unknown',
      executionDate,
      targetCohortCount: Math.floor(Math.random() * 50000) + 10000,
      comparatorCohortCount: Math.floor(Math.random() * 50000) + 10000,
      outcomes: outcomes.map((outcome: string) => this.generateOutcomeResult(outcome)),
    };
  }

  private generateOutcomeResult(outcome: string): OutcomeResult {
    const targetSubjects = Math.floor(Math.random() * 20000) + 5000;
    const comparatorSubjects = Math.floor(Math.random() * 20000) + 5000;
    const baseRate = Math.random() * 0.1 + 0.02;
    const hr = Math.random() * 1.5 + 0.5;
    const se = Math.random() * 0.15 + 0.05;

    return {
      outcome,
      targetSubjects,
      comparatorSubjects,
      targetOutcomes: Math.floor(targetSubjects * baseRate * (hr < 1 ? hr : 1)),
      comparatorOutcomes: Math.floor(comparatorSubjects * baseRate * (hr >= 1 ? 1 / hr : 1)),
      hazardRatio: hr,
      ciLower: Math.max(0.1, hr - 1.96 * se),
      ciUpper: hr + 1.96 * se,
      pValue: Math.random() * 0.1,
    };
  }

  getHRClass(hr: number, ciLower: number, ciUpper: number): string {
    if (ciUpper < 1) return 'protective';
    if (ciLower > 1) return 'harmful';
    return 'neutral';
  }

  getForestPosition(value: number): number {
    // Map HR values to 0-100% scale, centered at 1.0 = 50%
    // Using log scale for better visualization
    const logValue = Math.log(value);
    const position = 50 + (logValue / Math.log(4)) * 50;
    return Math.max(5, Math.min(95, position));
  }

  exportResults(): void {
    // Build CSV content
    const headers = ['Outcome', 'Target Events', 'Target Subjects', 'Comparator Events', 'Comparator Subjects', 'Hazard Ratio', 'CI Lower', 'CI Upper', 'P-value'];
    const rows = this.result.outcomes.map(o => [
      o.outcome,
      o.targetOutcomes.toString(),
      o.targetSubjects.toString(),
      o.comparatorOutcomes.toString(),
      o.comparatorSubjects.toString(),
      o.hazardRatio.toFixed(2),
      o.ciLower.toFixed(2),
      o.ciUpper.toFixed(2),
      o.pValue < 0.001 ? '< 0.001' : o.pValue.toFixed(3),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estimation_${this.data.estimation.id}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    const exportData = {
      estimation: {
        id: this.data.estimation.id,
        name: this.data.estimation.name,
        description: this.data.estimation.description,
        targetCohort: this.data.estimation.comparisons[0]?.targetCohort,
        comparatorCohort: this.data.estimation.comparisons[0]?.comparatorCohort,
      },
      execution: {
        sourceName: this.result.sourceName,
        executionDate: this.result.executionDate,
        targetCohortCount: this.result.targetCohortCount,
        comparatorCohortCount: this.result.comparatorCohortCount,
      },
      outcomes: this.result.outcomes,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estimation_${this.data.estimation.id}_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

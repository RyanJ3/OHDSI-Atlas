import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface StrataResult {
  strataName: string;
  personsAtRisk: number;
  personYears: number;
  outcomes: number;
  incidenceRate: number;
  irLower: number;
  irUpper: number;
}

@Component({
  selector: 'app-ir-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <i class="fas fa-chart-line"></i>
      Incidence Rate Results
    </h2>

    <mat-dialog-content>
      <div class="analysis-info">
        <h3>{{ data.analysis.name }}</h3>
        <p class="description">{{ data.analysis.description }}</p>
        <div class="cohort-info">
          <mat-chip class="target-chip">
            <i class="fas fa-users"></i>
            Target: {{ data.analysis.targetCohort }}
          </mat-chip>
          <mat-chip class="outcome-chip">
            <i class="fas fa-crosshairs"></i>
            Outcome: {{ data.analysis.outcomeCohort }}
          </mat-chip>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Overall Results -->
      <div class="overall-results">
        <h4>Overall Results</h4>
        <div class="results-grid">
          <mat-card class="result-card">
            <div class="result-label">Persons at Risk</div>
            <div class="result-value">{{ overallResult.personsAtRisk | number }}</div>
          </mat-card>

          <mat-card class="result-card">
            <div class="result-label">Person-Years</div>
            <div class="result-value">{{ overallResult.personYears | number:'1.0-0' }}</div>
          </mat-card>

          <mat-card class="result-card">
            <div class="result-label">Outcomes</div>
            <div class="result-value">{{ overallResult.outcomes | number }}</div>
          </mat-card>

          <mat-card class="result-card highlight">
            <div class="result-label">Incidence Rate</div>
            <div class="result-value">{{ overallResult.incidenceRate.toFixed(2) }}</div>
            <div class="result-unit">per 1,000 person-years</div>
            <div class="result-ci">
              95% CI: {{ overallResult.irLower.toFixed(2) }} - {{ overallResult.irUpper.toFixed(2) }}
            </div>
          </mat-card>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Stratified Results -->
      <div class="stratified-results">
        <h4>Results by Strata</h4>
        <table mat-table [dataSource]="strataResults" class="strata-table">
          <ng-container matColumnDef="strataName">
            <th mat-header-cell *matHeaderCellDef>Strata</th>
            <td mat-cell *matCellDef="let row">{{ row.strataName }}</td>
          </ng-container>

          <ng-container matColumnDef="personsAtRisk">
            <th mat-header-cell *matHeaderCellDef>Persons</th>
            <td mat-cell *matCellDef="let row">{{ row.personsAtRisk | number }}</td>
          </ng-container>

          <ng-container matColumnDef="personYears">
            <th mat-header-cell *matHeaderCellDef>Person-Years</th>
            <td mat-cell *matCellDef="let row">{{ row.personYears | number:'1.0-0' }}</td>
          </ng-container>

          <ng-container matColumnDef="outcomes">
            <th mat-header-cell *matHeaderCellDef>Outcomes</th>
            <td mat-cell *matCellDef="let row">{{ row.outcomes | number }}</td>
          </ng-container>

          <ng-container matColumnDef="incidenceRate">
            <th mat-header-cell *matHeaderCellDef>IR (95% CI)</th>
            <td mat-cell *matCellDef="let row">
              <span class="ir-value">{{ row.incidenceRate.toFixed(2) }}</span>
              <span class="ir-ci">({{ row.irLower.toFixed(2) }} - {{ row.irUpper.toFixed(2) }})</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="visual">
            <th mat-header-cell *matHeaderCellDef>Comparison</th>
            <td mat-cell *matCellDef="let row">
              <div class="ir-bar-container">
                <div
                  class="ir-bar"
                  [style.width.%]="(row.incidenceRate / maxIR) * 100"
                  [matTooltip]="'IR: ' + row.incidenceRate.toFixed(2)"
                ></div>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>

      <!-- Time Trends -->
      <div class="time-trends">
        <h4>Incidence Over Time</h4>
        <div class="trend-chart">
          <div class="chart-bars">
            @for (year of yearlyRates; track year.year) {
              <div class="year-bar">
                <div
                  class="bar-fill"
                  [style.height.%]="(year.rate / maxYearlyRate) * 100"
                  [matTooltip]="year.year + ': ' + year.rate.toFixed(2) + ' per 1,000 PY'"
                ></div>
                <span class="year-label">{{ year.year }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="exportResults()">
        <i class="fas fa-download"></i>
        Export
      </button>
      <button mat-raised-button color="primary" mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      i { color: #1976d2; }
    }

    mat-dialog-content {
      min-width: 750px;
      max-height: 70vh;
    }

    .analysis-info {
      padding: 16px 0;
      h3 { margin: 0 0 8px 0; color: #333; }
      .description { color: #666; font-size: 14px; margin: 0 0 12px 0; }
      .cohort-info {
        display: flex;
        gap: 8px;
        .target-chip { background: #e3f2fd !important; color: #1565c0 !important; }
        .outcome-chip { background: #fce4ec !important; color: #c2185b !important; }
        mat-chip i { margin-right: 6px; }
      }
    }

    h4 { margin: 16px 0 12px 0; color: #333; font-weight: 500; }

    .overall-results { padding: 8px 0; }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .result-card {
      padding: 16px;
      text-align: center;

      .result-label { font-size: 11px; color: #666; text-transform: uppercase; }
      .result-value { font-size: 24px; font-weight: 600; color: #333; margin: 8px 0; }
      .result-unit { font-size: 11px; color: #888; }
      .result-ci { font-size: 11px; color: #888; margin-top: 4px; }

      &.highlight {
        background: #e3f2fd;
        .result-value { color: #1565c0; }
      }
    }

    .strata-table {
      width: 100%;
      margin-top: 12px;

      th { background: #fafafa; font-weight: 600; font-size: 12px; }
      td { padding: 10px 16px; font-size: 13px; }

      .ir-value { font-weight: 600; color: #1565c0; }
      .ir-ci { font-size: 11px; color: #888; margin-left: 4px; }
    }

    .ir-bar-container {
      width: 100px;
      height: 12px;
      background: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }

    .ir-bar {
      height: 100%;
      background: linear-gradient(90deg, #1976d2, #42a5f5);
      border-radius: 6px;
      transition: width 0.3s;
    }

    .time-trends { padding: 8px 0; }

    .trend-chart {
      background: #fafafa;
      border-radius: 8px;
      padding: 20px;
    }

    .chart-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 150px;
      gap: 8px;
    }

    .year-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .bar-fill {
        width: 100%;
        max-width: 40px;
        background: linear-gradient(180deg, #1976d2, #42a5f5);
        border-radius: 4px 4px 0 0;
        min-height: 4px;
        transition: height 0.3s;
      }

      .year-label {
        font-size: 11px;
        color: #666;
        margin-top: 8px;
      }
    }

    mat-dialog-actions button i { margin-right: 6px; }
  `],
})
export class IrResultsDialogComponent {
  overallResult!: StrataResult;
  strataResults: StrataResult[] = [];
  yearlyRates: { year: number; rate: number }[] = [];
  maxIR = 0;
  maxYearlyRate = 0;

  displayedColumns = ['strataName', 'personsAtRisk', 'personYears', 'outcomes', 'incidenceRate', 'visual'];

  constructor(
    public dialogRef: MatDialogRef<IrResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { analysis: any }
  ) {
    this.generateMockResults();
  }

  private generateMockResults(): void {
    const baseIR = this.data.analysis.incidenceRate || Math.random() * 20 + 5;
    const totalPersons = Math.floor(Math.random() * 50000) + 20000;
    const personYears = totalPersons * (Math.random() * 2 + 1);
    const outcomes = Math.floor(personYears * baseIR / 1000);

    this.overallResult = {
      strataName: 'Overall',
      personsAtRisk: totalPersons,
      personYears,
      outcomes,
      incidenceRate: baseIR,
      irLower: baseIR * 0.85,
      irUpper: baseIR * 1.15,
    };

    const strata = ['Age 18-44', 'Age 45-64', 'Age 65+', 'Male', 'Female'];
    this.strataResults = strata.map(strataName => {
      const persons = Math.floor(totalPersons * (Math.random() * 0.3 + 0.1));
      const py = persons * (Math.random() * 2 + 0.5);
      const ir = baseIR * (Math.random() * 0.8 + 0.6);
      return {
        strataName,
        personsAtRisk: persons,
        personYears: py,
        outcomes: Math.floor(py * ir / 1000),
        incidenceRate: ir,
        irLower: ir * 0.8,
        irUpper: ir * 1.2,
      };
    });

    this.maxIR = Math.max(...this.strataResults.map(s => s.incidenceRate));

    // Generate yearly rates
    for (let year = 2019; year <= 2024; year++) {
      const variation = (Math.random() - 0.5) * 0.4;
      this.yearlyRates.push({
        year,
        rate: baseIR * (1 + variation),
      });
    }
    this.maxYearlyRate = Math.max(...this.yearlyRates.map(y => y.rate));
  }

  exportResults(): void {
    alert('Exporting results... (feature simulation)');
  }
}

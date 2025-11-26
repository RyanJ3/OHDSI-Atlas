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
  templateUrl: './estimation-results-dialog.component.html',
  styleUrl: './estimation-results-dialog.component.scss',
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

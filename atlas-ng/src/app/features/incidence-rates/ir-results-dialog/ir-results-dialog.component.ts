import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,
  ],
  templateUrl: './ir-results-dialog.component.html',
  styleUrl: './ir-results-dialog.component.scss',
})
export class IrResultsDialogComponent {
  private snackBar = inject(MatSnackBar);

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
    const exportData = {
      analysis: this.data.analysis.name,
      overallResults: this.overallResult,
      strataResults: this.strataResults,
      yearlyRates: this.yearlyRates,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ir-results-${this.data.analysis.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'analysis'}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Results exported successfully', 'OK', { duration: 3000 });
  }
}

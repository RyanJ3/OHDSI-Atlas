import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';

interface CovariateResult {
  name: string;
  category: string;
  targetCount: number;
  targetPercent: number;
  comparatorCount?: number;
  comparatorPercent?: number;
  stdDiff?: number;
}

@Component({
  selector: 'app-characterization-results-dialog',
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
    MatProgressBarModule,
    MatSortModule,
    MatMenuModule,
  ],
  templateUrl: './characterization-results-dialog.component.html',
  styleUrl: './characterization-results-dialog.component.scss',
})
export class CharacterizationResultsDialogComponent {
  covariates: CovariateResult[] = [];
  categories: string[] = ['Demographics', 'Conditions', 'Drugs'];
  totalSubjects = 0;
  latestExecution: any;

  constructor(
    public dialogRef: MatDialogRef<CharacterizationResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { characterization: any }
  ) {
    this.latestExecution = data.characterization.latestExecution;
    this.generateMockResults();
  }

  private generateMockResults(): void {
    this.totalSubjects = Math.floor(Math.random() * 50000) + 10000;

    const demographics = [
      'Age 18-34', 'Age 35-54', 'Age 55-64', 'Age 65+',
      'Male', 'Female', 'Race: White', 'Race: Black', 'Race: Asian', 'Race: Other'
    ];

    const conditions = [
      'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Obesity',
      'Coronary artery disease', 'Heart failure', 'Atrial fibrillation',
      'COPD', 'Chronic kidney disease', 'Depression'
    ];

    const drugs = [
      'ACE inhibitors', 'Beta blockers', 'Statins', 'Metformin',
      'Aspirin', 'Proton pump inhibitors', 'Diuretics',
      'Calcium channel blockers', 'ARBs', 'Anticoagulants'
    ];

    this.covariates = [
      ...demographics.map(name => this.createCovariate(name, 'Demographics')),
      ...conditions.map(name => this.createCovariate(name, 'Conditions')),
      ...drugs.map(name => this.createCovariate(name, 'Drugs')),
    ];
  }

  private createCovariate(name: string, category: string): CovariateResult {
    const percent = Math.random() * 60 + 5;
    return {
      name,
      category,
      targetCount: Math.floor(this.totalSubjects * percent / 100),
      targetPercent: percent,
    };
  }

  getDemographicsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Demographics')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  getConditionsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Conditions')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  getDrugsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Drugs')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  }

  exportResults(): void {
    // Build CSV content
    const headers = ['Category', 'Covariate', 'Count', 'Prevalence (%)'];
    const rows = this.covariates.map(c => [
      c.category,
      c.name,
      c.targetCount.toString(),
      c.targetPercent.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characterization_${this.data.characterization.id}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    const exportData = {
      characterization: {
        id: this.data.characterization.id,
        name: this.data.characterization.name,
        description: this.data.characterization.description,
      },
      execution: this.latestExecution,
      summary: {
        totalSubjects: this.totalSubjects,
        covariateCount: this.covariates.length,
        categories: this.categories,
      },
      results: {
        demographics: this.getDemographicsCovariates(),
        conditions: this.getConditionsCovariates(),
        drugs: this.getDrugsCovariates(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characterization_${this.data.characterization.id}_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

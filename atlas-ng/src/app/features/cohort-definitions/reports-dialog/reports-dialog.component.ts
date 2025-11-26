import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Import mock data
import cohortGenerationsData from '../../../core/mock-data/cohort-generations.json';
import cohortReportsData from '../../../core/mock-data/cohort-reports.json';

interface InclusionRule {
  id: number;
  name: string;
  description: string;
  meetCount: number;
  gainCount: number;
  totalCount: number;
  percentMeet: number;
}

interface AgeDistribution {
  range: string;
  count: number;
  percent: number;
}

interface GenderDistribution {
  gender: string;
  count: number;
  percent: number;
}

interface DialogData {
  cohortId: number;
  cohortName: string;
}

@Component({
  selector: 'app-reports-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './reports-dialog.component.html',
  styleUrl: './reports-dialog.component.scss',
})
export class ReportsDialogComponent {
  private dialogRef = inject(MatDialogRef<ReportsDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  // Summary stats computed from mock generation data
  totalPersons = 0;
  totalSources = 0;
  avgPersonsPerSource = 0;

  // Data loaded from JSON
  inclusionRules: InclusionRule[] = [];
  ageDistribution: AgeDistribution[] = [];
  genderDistribution: GenderDistribution[] = [];

  inclusionColumns = ['id', 'name', 'meetCount', 'percentMeet', 'attrition'];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const cohortId = String(this.data.cohortId);

    // Load inclusion rules for this cohort
    const reportsData = cohortReportsData as any;
    const inclusionData = reportsData.inclusionRules[cohortId];
    this.inclusionRules = inclusionData || this.getDefaultInclusionRules();

    // Load demographics for this cohort
    const demoData = reportsData.demographics[cohortId];
    if (demoData) {
      this.ageDistribution = demoData.ageDistribution || [];
      this.genderDistribution = demoData.genderDistribution || [];
    } else {
      this.ageDistribution = this.getDefaultAgeDistribution();
      this.genderDistribution = this.getDefaultGenderDistribution();
    }

    // Calculate summary from generation data
    const generations = (cohortGenerationsData as any[]).filter(
      (g) => g.cohortId === this.data.cohortId && g.status === 'COMPLETE'
    );

    this.totalSources = generations.length;
    this.totalPersons = generations.reduce((sum, g) => sum + g.personCount, 0);
    this.avgPersonsPerSource = this.totalSources > 0
      ? Math.round(this.totalPersons / this.totalSources)
      : 0;
  }

  private getDefaultInclusionRules(): InclusionRule[] {
    return [
      {
        id: 1,
        name: 'Age >= 18',
        description: 'Patient must be 18 years or older',
        meetCount: 10000,
        gainCount: 10000,
        totalCount: 12000,
        percentMeet: 83.3,
      },
    ];
  }

  private getDefaultAgeDistribution(): AgeDistribution[] {
    return [
      { range: '18-34', count: 2500, percent: 25 },
      { range: '35-54', count: 4500, percent: 45 },
      { range: '55+', count: 3000, percent: 30 },
    ];
  }

  private getDefaultGenderDistribution(): GenderDistribution[] {
    return [
      { gender: 'Female', count: 5200, percent: 52 },
      { gender: 'Male', count: 4800, percent: 48 },
    ];
  }

  getAttritionWidth(rule: InclusionRule): number {
    const maxCount = this.inclusionRules[0]?.meetCount || 1;
    return (rule.meetCount / maxCount) * 100;
  }

  close(): void {
    this.dialogRef.close();
  }
}

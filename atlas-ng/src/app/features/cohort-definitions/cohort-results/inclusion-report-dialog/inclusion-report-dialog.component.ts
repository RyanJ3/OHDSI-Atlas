import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Import mock data
import cohortReportsData from '../../../../core/mock-data/cohort-reports.json';

interface InclusionRule {
  id: number;
  name: string;
  description: string;
  meetCount: number;
  gainCount: number;
  totalCount: number;
  percentMeet: number;
}

interface DialogData {
  cohortId: number;
  cohortName: string;
  sourceKey: string;
  sourceName: string;
  personCount: number;
}

@Component({
  selector: 'app-inclusion-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './inclusion-report-dialog.component.html',
  styleUrl: './inclusion-report-dialog.component.scss',
})
export class InclusionReportDialogComponent {
  private dialogRef = inject(MatDialogRef<InclusionReportDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  inclusionRules: InclusionRule[] = [];
  displayedColumns = ['id', 'name', 'meetCount', 'percentMeet', 'attrition'];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const cohortId = String(this.data.cohortId);
    const reportsData = cohortReportsData as any;
    const inclusionData = reportsData.inclusionRules[cohortId];

    if (inclusionData) {
      // Scale the numbers based on the actual person count for this source
      const scaleFactor = this.data.personCount / (inclusionData[inclusionData.length - 1]?.meetCount || 1);
      this.inclusionRules = inclusionData.map((rule: InclusionRule) => ({
        ...rule,
        meetCount: Math.round(rule.meetCount * scaleFactor),
        gainCount: Math.round(rule.gainCount * scaleFactor),
        totalCount: Math.round(rule.totalCount * scaleFactor),
      }));
    } else {
      this.inclusionRules = this.getDefaultRules();
    }
  }

  private getDefaultRules(): InclusionRule[] {
    const baseCount = this.data.personCount;
    return [
      {
        id: 1,
        name: 'Initial cohort entry',
        description: 'All patients meeting primary criteria',
        meetCount: Math.round(baseCount * 1.2),
        gainCount: Math.round(baseCount * 1.2),
        totalCount: Math.round(baseCount * 1.5),
        percentMeet: 80,
      },
      {
        id: 2,
        name: 'Final cohort',
        description: 'Patients meeting all criteria',
        meetCount: baseCount,
        gainCount: Math.round(baseCount * 0.2),
        totalCount: Math.round(baseCount * 1.2),
        percentMeet: 83.3,
      },
    ];
  }

  getAttritionWidth(rule: InclusionRule): number {
    const maxCount = this.inclusionRules[0]?.meetCount || 1;
    return (rule.meetCount / maxCount) * 100;
  }

  getFinalCount(): number {
    return this.inclusionRules[this.inclusionRules.length - 1]?.meetCount || 0;
  }

  close(): void {
    this.dialogRef.close();
  }
}

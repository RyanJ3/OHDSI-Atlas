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
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface TimelineEvent {
  date: string;
  type: 'condition' | 'drug' | 'procedure' | 'measurement' | 'observation' | 'visit';
  concept: string;
  value?: string;
  domain: string;
}

interface RecordCounts {
  conditions: number;
  drugs: number;
  procedures: number;
  measurements: number;
  observations: number;
  visits: number;
}

interface Profile {
  personId: number;
  gender: string;
  birthYear: number;
  deathYear: number | null;
  sourceName: string;
  cohorts: string[];
  recordCounts: RecordCounts;
  observationPeriod: { start: string; end: string };
}

@Component({
  selector: 'app-profile-detail-dialog',
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
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile-detail-dialog.component.html',
  styleUrl: './profile-detail-dialog.component.scss',
})
export class ProfileDetailDialogComponent {
  private snackBar = inject(MatSnackBar);
  timelineEvents: TimelineEvent[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProfileDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: Profile }
  ) {
    this.generateMockTimeline();
  }

  private generateMockTimeline(): void {
    const startDate = new Date(this.data.profile.observationPeriod.start);
    const endDate = new Date(this.data.profile.observationPeriod.end);
    const range = endDate.getTime() - startDate.getTime();

    const conditions = [
      'Essential hypertension',
      'Type 2 diabetes mellitus',
      'Hyperlipidemia',
      'Osteoarthritis',
      'Chronic obstructive pulmonary disease',
      'Major depressive disorder',
    ];

    const drugs = [
      'Metformin 500mg',
      'Lisinopril 10mg',
      'Atorvastatin 20mg',
      'Aspirin 81mg',
      'Omeprazole 20mg',
      'Sertraline 50mg',
    ];

    const procedures = [
      'Complete blood count',
      'Electrocardiogram',
      'Chest X-ray',
      'Colonoscopy',
      'Echocardiogram',
    ];

    const measurements = [
      { concept: 'Blood pressure systolic', value: '132 mmHg' },
      { concept: 'Blood pressure diastolic', value: '84 mmHg' },
      { concept: 'HbA1c', value: '7.2%' },
      { concept: 'LDL cholesterol', value: '118 mg/dL' },
      { concept: 'Creatinine', value: '1.1 mg/dL' },
    ];

    const events: TimelineEvent[] = [];

    // Add conditions
    for (let i = 0; i < Math.min(3, this.data.profile.recordCounts.conditions); i++) {
      events.push({
        date: new Date(startDate.getTime() + Math.random() * range).toISOString(),
        type: 'condition',
        concept: conditions[i % conditions.length],
        domain: 'Condition',
      });
    }

    // Add drugs
    for (let i = 0; i < Math.min(3, this.data.profile.recordCounts.drugs); i++) {
      events.push({
        date: new Date(startDate.getTime() + Math.random() * range).toISOString(),
        type: 'drug',
        concept: drugs[i % drugs.length],
        domain: 'Drug',
      });
    }

    // Add procedures
    for (let i = 0; i < Math.min(2, this.data.profile.recordCounts.procedures); i++) {
      events.push({
        date: new Date(startDate.getTime() + Math.random() * range).toISOString(),
        type: 'procedure',
        concept: procedures[i % procedures.length],
        domain: 'Procedure',
      });
    }

    // Add measurements
    for (let i = 0; i < Math.min(3, this.data.profile.recordCounts.measurements); i++) {
      const measurement = measurements[i % measurements.length];
      events.push({
        date: new Date(startDate.getTime() + Math.random() * range).toISOString(),
        type: 'measurement',
        concept: measurement.concept,
        value: measurement.value,
        domain: 'Measurement',
      });
    }

    // Add a visit
    events.push({
      date: new Date(startDate.getTime() + Math.random() * range).toISOString(),
      type: 'visit',
      concept: 'Outpatient visit',
      domain: 'Visit',
    });

    // Sort by date descending (most recent first)
    this.timelineEvents = events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  calculateAge(): number {
    const endYear = this.data.profile.deathYear || new Date().getFullYear();
    return endYear - this.data.profile.birthYear;
  }

  getObservationYears(): string {
    const start = new Date(this.data.profile.observationPeriod.start);
    const end = new Date(this.data.profile.observationPeriod.end);
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years.toFixed(1);
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  exportProfile(): void {
    const exportData = {
      personId: this.data.profile.personId,
      gender: this.data.profile.gender,
      birthYear: this.data.profile.birthYear,
      deathYear: this.data.profile.deathYear,
      sourceName: this.data.profile.sourceName,
      cohorts: this.data.profile.cohorts,
      recordCounts: this.data.profile.recordCounts,
      observationPeriod: this.data.profile.observationPeriod,
      timeline: this.timelineEvents,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-${this.data.profile.personId}-detail.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported profile for Person ${this.data.profile.personId}`, 'OK', { duration: 3000 });
  }

  viewFullTimeline(): void {
    this.snackBar.open('Full timeline view would open in a dedicated page', 'OK', { duration: 3000 });
  }
}

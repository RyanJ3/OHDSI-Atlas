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
import { MatIconModule } from '@angular/material/icon';

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
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person</mat-icon>
      Patient Profile: {{ data.profile.personId }}
    </h2>

    <mat-dialog-content>
      <!-- Demographics Section -->
      <div class="demographics-section">
        <div class="demo-grid">
          <mat-card class="demo-card">
            <div class="demo-icon gender-icon">
              <mat-icon>{{ data.profile.gender === 'Male' ? 'male' : 'female' }}</mat-icon>
            </div>
            <div class="demo-label">Gender</div>
            <div class="demo-value">{{ data.profile.gender }}</div>
          </mat-card>

          <mat-card class="demo-card">
            <div class="demo-icon age-icon">
              <mat-icon>cake</mat-icon>
            </div>
            <div class="demo-label">Age</div>
            <div class="demo-value">{{ calculateAge() }} years</div>
            <div class="demo-sublabel">Born {{ data.profile.birthYear }}</div>
          </mat-card>

          <mat-card class="demo-card">
            <div class="demo-icon source-icon">
              <mat-icon>storage</mat-icon>
            </div>
            <div class="demo-label">Data Source</div>
            <div class="demo-value">{{ data.profile.sourceName }}</div>
          </mat-card>

          <mat-card class="demo-card">
            <div class="demo-icon obs-icon">
              <mat-icon>date_range</mat-icon>
            </div>
            <div class="demo-label">Observation Period</div>
            <div class="demo-value">{{ getObservationYears() }} years</div>
            <div class="demo-sublabel">{{ formatDate(data.profile.observationPeriod.start) }} - {{ formatDate(data.profile.observationPeriod.end) }}</div>
          </mat-card>
        </div>

        @if (data.profile.deathYear) {
          <div class="deceased-banner">
            <mat-icon>warning</mat-icon>
            Deceased in {{ data.profile.deathYear }}
          </div>
        }
      </div>

      <mat-divider></mat-divider>

      <!-- Cohort Memberships -->
      <div class="cohorts-section">
        <h4>Cohort Memberships</h4>
        <div class="cohort-chips">
          @for (cohort of data.profile.cohorts; track cohort) {
            <mat-chip>{{ cohort }}</mat-chip>
          }
          @if (data.profile.cohorts.length === 0) {
            <span class="no-cohorts">No cohort memberships</span>
          }
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Record Counts -->
      <div class="records-section">
        <h4>Clinical Records Summary</h4>
        <div class="records-grid">
          <div class="record-card" [class.has-records]="data.profile.recordCounts.conditions > 0">
            <mat-icon>healing</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.conditions | number }}</span>
            <span class="record-label">Conditions</span>
          </div>
          <div class="record-card" [class.has-records]="data.profile.recordCounts.drugs > 0">
            <mat-icon>medication</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.drugs | number }}</span>
            <span class="record-label">Drug Exposures</span>
          </div>
          <div class="record-card" [class.has-records]="data.profile.recordCounts.procedures > 0">
            <mat-icon>medical_services</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.procedures | number }}</span>
            <span class="record-label">Procedures</span>
          </div>
          <div class="record-card" [class.has-records]="data.profile.recordCounts.measurements > 0">
            <mat-icon>science</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.measurements | number }}</span>
            <span class="record-label">Measurements</span>
          </div>
          <div class="record-card" [class.has-records]="data.profile.recordCounts.observations > 0">
            <mat-icon>visibility</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.observations | number }}</span>
            <span class="record-label">Observations</span>
          </div>
          <div class="record-card" [class.has-records]="data.profile.recordCounts.visits > 0">
            <mat-icon>local_hospital</mat-icon>
            <span class="record-count">{{ data.profile.recordCounts.visits | number }}</span>
            <span class="record-label">Visits</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Timeline -->
      <div class="timeline-section">
        <h4>Clinical Timeline (Sample Events)</h4>
        <div class="timeline">
          @for (event of timelineEvents; track event.date + event.concept) {
            <div class="timeline-event">
              <div class="event-marker" [class]="event.type"></div>
              <div class="event-content">
                <div class="event-date">{{ formatDate(event.date) }}</div>
                <div class="event-domain">
                  <mat-chip class="domain-chip" [class]="event.type">{{ event.domain }}</mat-chip>
                </div>
                <div class="event-concept">{{ event.concept }}</div>
                @if (event.value) {
                  <div class="event-value">Value: {{ event.value }}</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="exportProfile()">
        <mat-icon>download</mat-icon>
        Export
      </button>
      <button mat-button (click)="viewFullTimeline()">
        <mat-icon>timeline</mat-icon>
        Full Timeline
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
      mat-icon { color: #1976d2; }
    }

    mat-dialog-content {
      min-width: 700px;
      max-height: 70vh;
    }

    .demographics-section {
      padding: 16px 0;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .demo-card {
      padding: 16px;
      text-align: center;

      .demo-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        mat-icon { font-size: 24px; width: 24px; height: 24px; }
      }

      .gender-icon { background: #e3f2fd; mat-icon { color: #1976d2; } }
      .age-icon { background: #fce4ec; mat-icon { color: #c2185b; } }
      .source-icon { background: #e8f5e9; mat-icon { color: #388e3c; } }
      .obs-icon { background: #fff3e0; mat-icon { color: #f57c00; } }

      .demo-label { font-size: 11px; color: #666; text-transform: uppercase; }
      .demo-value { font-size: 18px; font-weight: 600; color: #333; margin: 4px 0; }
      .demo-sublabel { font-size: 11px; color: #888; }
    }

    .deceased-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      mat-icon { font-size: 20px; }
    }

    h4 {
      margin: 16px 0 12px;
      color: #333;
      font-weight: 500;
    }

    .cohorts-section {
      padding: 8px 0;
    }

    .cohort-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      mat-chip {
        background: #e3f2fd !important;
        color: #1565c0 !important;
      }

      .no-cohorts {
        color: #888;
        font-style: italic;
      }
    }

    .records-section {
      padding: 8px 0;
    }

    .records-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }

    .record-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 8px;
      background: #f5f5f5;
      border-radius: 8px;
      transition: all 0.2s;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #9e9e9e;
        margin-bottom: 8px;
      }

      .record-count {
        font-size: 20px;
        font-weight: 600;
        color: #666;
      }

      .record-label {
        font-size: 10px;
        color: #888;
        text-align: center;
      }

      &.has-records {
        background: #e3f2fd;
        mat-icon { color: #1976d2; }
        .record-count { color: #1565c0; }
      }
    }

    .timeline-section {
      padding: 8px 0;
    }

    .timeline {
      position: relative;
      padding-left: 24px;
      border-left: 2px solid #e0e0e0;
      margin-left: 8px;
    }

    .timeline-event {
      position: relative;
      padding: 12px 0 12px 20px;
      margin-left: -25px;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .event-marker {
      position: absolute;
      left: -6px;
      top: 16px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

      &.condition { background: #e91e63; }
      &.drug { background: #9c27b0; }
      &.procedure { background: #2196f3; }
      &.measurement { background: #4caf50; }
      &.observation { background: #ff9800; }
      &.visit { background: #607d8b; }
    }

    .event-content {
      display: grid;
      grid-template-columns: 100px auto 1fr;
      gap: 12px;
      align-items: center;
    }

    .event-date {
      font-size: 12px;
      color: #666;
    }

    .domain-chip {
      font-size: 10px !important;
      min-height: 20px !important;
      padding: 0 8px !important;

      &.condition { background: #fce4ec !important; color: #c2185b !important; }
      &.drug { background: #f3e5f5 !important; color: #7b1fa2 !important; }
      &.procedure { background: #e3f2fd !important; color: #1565c0 !important; }
      &.measurement { background: #e8f5e9 !important; color: #2e7d32 !important; }
      &.observation { background: #fff3e0 !important; color: #ef6c00 !important; }
      &.visit { background: #eceff1 !important; color: #455a64 !important; }
    }

    .event-concept {
      font-weight: 500;
      color: #333;
    }

    .event-value {
      grid-column: 3;
      font-size: 12px;
      color: #666;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class ProfileDetailDialogComponent {
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

    // Generate sample events
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
    alert(`Exporting profile for Person ${this.data.profile.personId}... (feature simulation)`);
  }

  viewFullTimeline(): void {
    alert(`Opening full timeline view for Person ${this.data.profile.personId}... (feature simulation)`);
  }
}

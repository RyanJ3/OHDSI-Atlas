import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

interface JobParameters {
  jobName: string;
  jobAuthor?: string;
  cohort_definition_id?: string;
  source_id?: string;
  analysis_id?: string;
  characterization_id?: string;
  pathway_id?: string;
  estimation_id?: string;
  prediction_id?: string;
  [key: string]: string | undefined;
}

interface Job {
  executionId: number;
  jobName: string;
  jobParameters: JobParameters;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'STOPPED' | 'STARTING' | 'UNKNOWN';
  startDate: string;
  endDate: string | null;
  exitStatus: string | null;
}

@Component({
  selector: 'app-job-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './job-details-dialog.component.html',
  styleUrl: './job-details-dialog.component.scss',
})
export class JobDetailsDialogComponent {
  job: Job;

  constructor(
    public dialogRef: MatDialogRef<JobDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: Job }
  ) {
    this.job = data.job;
  }

  getJobDisplayName(): string {
    const paramName = this.job.jobParameters.jobName;
    if (paramName && paramName !== this.job.jobName) {
      return paramName;
    }

    const nameMap: Record<string, string> = {
      generateCohort: 'Generate Cohort',
      runIRAnalysis: 'Incidence Rate Analysis',
      runCharacterization: 'Characterization',
      runPathwayAnalysis: 'Pathway Analysis',
      runPLEAnalysis: 'Population Level Estimation',
      runPLPAnalysis: 'Patient Level Prediction',
      warmCache: 'Warm Cache',
    };

    return nameMap[this.job.jobName] || this.job.jobName;
  }

  getStatusClass(): string {
    return `status-${this.job.status.toLowerCase()}`;
  }

  getStatusIcon(): string {
    switch (this.job.status) {
      case 'COMPLETED':
        return 'fas fa-check-circle';
      case 'RUNNING':
        return 'fas fa-spinner fa-spin';
      case 'FAILED':
        return 'fas fa-exclamation-circle';
      case 'STOPPED':
        return 'fas fa-stop-circle';
      case 'STARTING':
        return 'fas fa-hourglass-start';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  }

  calculateDuration(): string {
    if (!this.job.endDate) {
      if (this.job.status === 'RUNNING') {
        return this.getRunningDuration();
      }
      return '-';
    }
    try {
      const start = new Date(this.job.startDate).getTime();
      const end = new Date(this.job.endDate).getTime();
      const diffMs = end - start;

      if (diffMs < 0) return '-';

      const seconds = Math.floor(diffMs / 1000);
      if (seconds < 60) return `${seconds} seconds`;

      const minutes = Math.floor(seconds / 60);
      const remainingSecs = seconds % 60;
      if (minutes < 60) return `${minutes}m ${remainingSecs}s`;

      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours}h ${remainingMins}m`;
    } catch {
      return '-';
    }
  }

  getRunningDuration(): string {
    try {
      const start = new Date(this.job.startDate).getTime();
      const now = Date.now();
      const diffMs = now - start;

      const seconds = Math.floor(diffMs / 1000);
      if (seconds < 60) return `${seconds}s (running)`;

      const minutes = Math.floor(seconds / 60);
      const remainingSecs = seconds % 60;
      if (minutes < 60) return `${minutes}m ${remainingSecs}s (running)`;

      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours}h ${remainingMins}m (running)`;
    } catch {
      return '-';
    }
  }

  getJobParameters(): { key: string; value: string }[] {
    const params: { key: string; value: string }[] = [];
    const skipKeys = ['jobName', 'jobAuthor'];

    for (const [key, value] of Object.entries(this.job.jobParameters)) {
      if (!skipKeys.includes(key) && value !== undefined) {
        params.push({
          key: this.formatParameterKey(key),
          value: String(value),
        });
      }
    }

    return params;
  }

  formatParameterKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  getJobTypeIcon(): string {
    switch (this.job.jobName) {
      case 'generateCohort':
        return 'fas fa-users';
      case 'runIRAnalysis':
        return 'fas fa-bolt';
      case 'runCharacterization':
        return 'fas fa-chart-bar';
      case 'runPathwayAnalysis':
        return 'fas fa-sitemap';
      case 'runPLEAnalysis':
        return 'fas fa-balance-scale';
      case 'runPLPAnalysis':
        return 'fas fa-heartbeat';
      case 'warmCache':
        return 'fas fa-database';
      default:
        return 'fas fa-cog';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

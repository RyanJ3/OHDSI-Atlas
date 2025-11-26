import { Component, Inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Cohort {
  id: number;
  name: string;
}

interface PathwayResult {
  path: string[];
  count: number;
  pct: number;
}

interface ExecutionResults {
  totalPatients: number;
  pathwaysFound: number;
  topPathways: PathwayResult[];
}

interface Execution {
  sourceKey: string;
  sourceName: string;
  status: 'COMPLETE' | 'RUNNING' | 'FAILED' | 'PENDING';
  startTime: string;
  endTime: string | null;
  results: ExecutionResults | null;
  errorMessage?: string;
}

interface PathwayAnalysis {
  id: number;
  name: string;
  description: string;
  targetCohorts: Cohort[];
  eventCohorts: Cohort[];
  combinationWindow: number;
  minCellCount: number;
  maxDepth: number;
  allowRepeats: boolean;
  executions: Execution[];
}

@Component({
  selector: 'app-pathway-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './pathway-results-dialog.component.html',
  styleUrl: './pathway-results-dialog.component.scss',
})
export class PathwayResultsDialogComponent {
  analysis: PathwayAnalysis;
  selectedSourceKey = signal<string>('');

  completedExecutions = computed(() =>
    this.analysis.executions.filter(e => e.status === 'COMPLETE' && e.results)
  );

  selectedExecution = computed(() =>
    this.completedExecutions().find(e => e.sourceKey === this.selectedSourceKey()) ||
    this.completedExecutions()[0]
  );

  displayedColumns = ['rank', 'pathway', 'count', 'percentage', 'bar'];

  constructor(
    public dialogRef: MatDialogRef<PathwayResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { analysis: PathwayAnalysis }
  ) {
    this.analysis = data.analysis;

    // Set initial source selection
    const firstComplete = this.completedExecutions()[0];
    if (firstComplete) {
      this.selectedSourceKey.set(firstComplete.sourceKey);
    }
  }

  onSourceChange(sourceKey: string): void {
    this.selectedSourceKey.set(sourceKey);
  }

  getPathwayDisplay(path: string[]): string {
    return path.join(' → ');
  }

  getPathwaySteps(path: string[]): string[] {
    return path;
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatPercentage(pct: number): string {
    return `${pct.toFixed(1)}%`;
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  }

  getMaxPercentage(): number {
    const exec = this.selectedExecution();
    if (!exec?.results?.topPathways?.length) return 100;
    return Math.max(...exec.results.topPathways.map(p => p.pct));
  }

  getBarWidth(pct: number): number {
    const max = this.getMaxPercentage();
    return max > 0 ? (pct / max) * 100 : 0;
  }

  getStepColor(index: number): string {
    const colors = [
      '#7b1fa2', // purple
      '#1976d2', // blue
      '#388e3c', // green
      '#f57c00', // orange
      '#c2185b', // pink
      '#0097a7', // teal
      '#7c4dff', // deep purple
      '#ff5722', // deep orange
    ];
    return colors[index % colors.length];
  }

  close(): void {
    this.dialogRef.close();
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SourceService, Source, MOCK_SOURCE_KEY } from '../../../core/services/source.service';
import { catchError, of, delay } from 'rxjs';

export interface GenerateDialogData {
  cohortId: number;
  cohortName: string;
}

interface SourceGeneration {
  source: Source;
  selected: boolean;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  recordCount?: number;
  personCount?: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-generate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './generate-dialog.component.html',
  styleUrl: './generate-dialog.component.scss',
})
export class GenerateDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<GenerateDialogComponent>);
  private data: GenerateDialogData = inject(MAT_DIALOG_DATA);
  private sourceService = inject(SourceService);

  cohortName = this.data.cohortName;
  cohortId = this.data.cohortId;

  loading = signal(true);
  generating = signal(false);
  sources = signal<SourceGeneration[]>([]);
  allComplete = signal(false);

  ngOnInit(): void {
    this.loadSources();
  }

  private loadSources(): void {
    this.sourceService
      .getSources()
      .pipe(
        catchError(() => of([]))
      )
      .subscribe((sources) => {
        // Filter to sources with Results daimon (needed for generation)
        const generationSources = sources
          .filter((s) => s.daimons?.some((d) => d.daimonType === 'Results' || d.daimonType === 'CDM'))
          .map((source) => ({
            source,
            selected: source.sourceKey !== MOCK_SOURCE_KEY, // Don't select mock by default
            status: 'pending' as const,
            progress: 0,
          }));
        this.sources.set(generationSources);
        this.loading.set(false);
      });
  }

  get selectedCount(): number {
    return this.sources().filter((s) => s.selected).length;
  }

  toggleAll(checked: boolean): void {
    this.sources.update((sources) =>
      sources.map((s) => ({ ...s, selected: checked }))
    );
  }

  generate(): void {
    const selected = this.sources().filter((s) => s.selected);
    if (selected.length === 0) return;

    this.generating.set(true);

    // Simulate generation for each selected source
    selected.forEach((sourceGen, index) => {
      this.updateSourceStatus(sourceGen.source.sourceKey, 'generating', 0);

      // Simulate progress with delays
      this.simulateGeneration(sourceGen.source.sourceKey, index);
    });
  }

  private simulateGeneration(sourceKey: string, delayIndex: number): void {
    const baseDelay = 500 + delayIndex * 200;

    // Progress updates
    setTimeout(() => this.updateSourceStatus(sourceKey, 'generating', 25), baseDelay);
    setTimeout(() => this.updateSourceStatus(sourceKey, 'generating', 50), baseDelay + 500);
    setTimeout(() => this.updateSourceStatus(sourceKey, 'generating', 75), baseDelay + 1000);
    setTimeout(() => {
      // Random success/error for demo
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        const recordCount = Math.floor(Math.random() * 50000) + 1000;
        const personCount = Math.floor(recordCount * 0.8);
        this.updateSourceStatus(sourceKey, 'complete', 100, recordCount, personCount);
      } else {
        this.updateSourceStatus(sourceKey, 'error', 0, 0, 0, 'Generation failed: Connection timeout');
      }
      this.checkAllComplete();
    }, baseDelay + 1500);
  }

  private updateSourceStatus(
    sourceKey: string,
    status: 'pending' | 'generating' | 'complete' | 'error',
    progress: number,
    recordCount?: number,
    personCount?: number,
    errorMessage?: string
  ): void {
    this.sources.update((sources) =>
      sources.map((s) =>
        s.source.sourceKey === sourceKey
          ? { ...s, status, progress, recordCount, personCount, errorMessage }
          : s
      )
    );
  }

  private checkAllComplete(): void {
    const selected = this.sources().filter((s) => s.selected);
    const allDone = selected.every((s) => s.status === 'complete' || s.status === 'error');
    if (allDone) {
      this.allComplete.set(true);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'generating':
        return 'fas fa-spinner fa-spin';
      case 'complete':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-question';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  done(): void {
    const results = this.sources()
      .filter((s) => s.selected && s.status === 'complete')
      .map((s) => ({
        sourceKey: s.source.sourceKey,
        sourceName: s.source.sourceName,
        recordCount: s.recordCount,
        personCount: s.personCount,
      }));
    this.dialogRef.close(results);
  }
}

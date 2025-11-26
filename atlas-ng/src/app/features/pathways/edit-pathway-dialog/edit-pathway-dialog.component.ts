import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { AddCohortDialogComponent, AddCohortDialogData, AddCohortDialogResult } from '../add-cohort-dialog/add-cohort-dialog.component';

interface Cohort {
  id: number;
  name: string;
}

interface PathwayAnalysis {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  targetCohorts: Cohort[];
  eventCohorts: Cohort[];
  combinationWindow: number;
  minCellCount: number;
  maxDepth: number;
  allowRepeats: boolean;
  executions: any[];
}

@Component({
  selector: 'app-edit-pathway-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-pathway-dialog.component.html',
  styleUrl: './edit-pathway-dialog.component.scss',
})
export class EditPathwayDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<EditPathwayDialogComponent>);
  data = inject<{ analysis: PathwayAnalysis }>(MAT_DIALOG_DATA);

  cohortColumns = ['id', 'name', 'actions'];
  targetCohorts: Cohort[] = [];
  eventCohorts: Cohort[] = [];
  originalValues: any;
  originalTargetCohorts: Cohort[] = [];
  originalEventCohorts: Cohort[] = [];

  // Data sources for MatTable refresh
  targetCohortsDataSource: Cohort[] = [];
  eventCohortsDataSource: Cohort[] = [];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    combinationWindow: [0],
    minCellCount: [5],
    maxDepth: [5],
    allowRepeats: [false],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.analysis.name,
      description: this.data.analysis.description || '',
      combinationWindow: this.data.analysis.combinationWindow,
      minCellCount: this.data.analysis.minCellCount,
      maxDepth: this.data.analysis.maxDepth,
      allowRepeats: this.data.analysis.allowRepeats,
    });

    this.targetCohorts = [...this.data.analysis.targetCohorts];
    this.eventCohorts = [...this.data.analysis.eventCohorts];

    // Store original cohorts for change detection
    this.originalTargetCohorts = this.data.analysis.targetCohorts.map(c => ({ ...c }));
    this.originalEventCohorts = this.data.analysis.eventCohorts.map(c => ({ ...c }));

    this.originalValues = {
      ...this.form.value,
    };

    // Initialize data sources
    this.refreshDataSources();
  }

  private refreshDataSources(): void {
    // Create new array references to trigger MatTable refresh
    this.targetCohortsDataSource = [...this.targetCohorts];
    this.eventCohortsDataSource = [...this.eventCohorts];
  }

  removeTargetCohort(cohort: Cohort): void {
    const dialogData: ConfirmDialogData = {
      title: 'Remove Target Cohort',
      message: `Are you sure you want to remove "${cohort.name}" from target cohorts?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'warning',
    };

    this.dialog.open(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          const index = this.targetCohorts.findIndex(c => c.id === cohort.id);
          if (index >= 0) {
            this.targetCohorts.splice(index, 1);
            this.refreshDataSources();
            this.snackBar.open(`Removed "${cohort.name}" from target cohorts`, 'OK', {
              duration: 3000,
            });
          }
        }
      });
  }

  addTargetCohort(): void {
    const dialogData: AddCohortDialogData = {
      title: 'Add Target Cohort',
      type: 'target',
      existingCohortIds: this.targetCohorts.map(c => c.id),
    };

    this.dialog.open(AddCohortDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((result: AddCohortDialogResult | undefined) => {
        if (result?.cohort) {
          this.targetCohorts.push(result.cohort);
          this.refreshDataSources();
          this.snackBar.open(`Added "${result.cohort.name}" to target cohorts`, 'OK', {
            duration: 3000,
          });
        }
      });
  }

  removeEventCohort(cohort: Cohort): void {
    const dialogData: ConfirmDialogData = {
      title: 'Remove Event Cohort',
      message: `Are you sure you want to remove "${cohort.name}" from event cohorts?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'warning',
    };

    this.dialog.open(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          const index = this.eventCohorts.findIndex(c => c.id === cohort.id);
          if (index >= 0) {
            this.eventCohorts.splice(index, 1);
            this.refreshDataSources();
            this.snackBar.open(`Removed "${cohort.name}" from event cohorts`, 'OK', {
              duration: 3000,
            });
          }
        }
      });
  }

  addEventCohort(): void {
    const dialogData: AddCohortDialogData = {
      title: 'Add Event Cohort',
      type: 'event',
      existingCohortIds: this.eventCohorts.map(c => c.id),
    };

    this.dialog.open(AddCohortDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((result: AddCohortDialogResult | undefined) => {
        if (result?.cohort) {
          this.eventCohorts.push(result.cohort);
          this.refreshDataSources();
          this.snackBar.open(`Added "${result.cohort.name}" to event cohorts`, 'OK', {
            duration: 3000,
          });
        }
      });
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    const formChanged = (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.combinationWindow !== this.originalValues.combinationWindow ||
      formValue.minCellCount !== this.originalValues.minCellCount ||
      formValue.maxDepth !== this.originalValues.maxDepth ||
      formValue.allowRepeats !== this.originalValues.allowRepeats
    );

    const targetCohortsChanged = !this.areCohortsEqual(this.targetCohorts, this.originalTargetCohorts);
    const eventCohortsChanged = !this.areCohortsEqual(this.eventCohorts, this.originalEventCohorts);

    return formChanged || targetCohortsChanged || eventCohortsChanged;
  }

  private areCohortsEqual(a: Cohort[], b: Cohort[]): boolean {
    if (a.length !== b.length) return false;
    const aIds = a.map(c => c.id).sort();
    const bIds = b.map(c => c.id).sort();
    return aIds.every((id, i) => id === bIds[i]);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  }

  save(): void {
    if (this.form.valid) {
      const updatedAnalysis = {
        ...this.data.analysis,
        ...this.form.value,
        targetCohorts: this.targetCohorts,
        eventCohorts: this.eventCohorts,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedAnalysis);
    }
  }
}

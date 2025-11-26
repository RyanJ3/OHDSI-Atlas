import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface Prediction {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  modelType: string;
  targetCohort: string;
  outcomeCohort: string;
  timeAtRisk: string;
  tags: string[];
  executions: number;
  latestExecution: any;
}

@Component({
  selector: 'app-edit-prediction-dialog',
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
    MatChipsModule,
  ],
  templateUrl: './edit-prediction-dialog.component.html',
  styleUrl: './edit-prediction-dialog.component.scss',
})
export class EditPredictionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPredictionDialogComponent>);
  data = inject<{ prediction: Prediction }>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];
  targetCohort: string = '';
  outcomeCohort: string = '';
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    modelType: [''],
    timeAtRisk: [''],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.prediction.name,
      description: this.data.prediction.description || '',
      modelType: this.data.prediction.modelType,
      timeAtRisk: this.data.prediction.timeAtRisk,
    });

    this.tags = [...(this.data.prediction.tags || [])];
    this.targetCohort = this.data.prediction.targetCohort || '';
    this.outcomeCohort = this.data.prediction.outcomeCohort || '';

    this.originalValues = {
      ...this.form.value,
      tags: [...this.tags],
      targetCohort: this.targetCohort,
      outcomeCohort: this.outcomeCohort,
    };
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selectTargetCohort(): void {
    this.targetCohort = this.targetCohort || 'Selected Target Cohort';
  }

  selectOutcomeCohort(): void {
    this.outcomeCohort = this.outcomeCohort || 'Selected Outcome Cohort';
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.modelType !== this.originalValues.modelType ||
      formValue.timeAtRisk !== this.originalValues.timeAtRisk ||
      JSON.stringify(this.tags.sort()) !== JSON.stringify(this.originalValues.tags.sort()) ||
      this.targetCohort !== this.originalValues.targetCohort ||
      this.outcomeCohort !== this.originalValues.outcomeCohort
    );
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
      const updatedPrediction = {
        ...this.data.prediction,
        ...this.form.value,
        tags: this.tags,
        targetCohort: this.targetCohort,
        outcomeCohort: this.outcomeCohort,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedPrediction);
    }
  }
}

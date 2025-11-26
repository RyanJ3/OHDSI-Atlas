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
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface Comparison {
  targetCohort: string;
  comparatorCohort: string;
  outcomes: string[];
}

interface Estimation {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  type: string;
  comparisons: Comparison[];
  tags: string[];
  executions: number;
  latestExecution: any;
}

@Component({
  selector: 'app-edit-estimation-dialog',
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
    MatChipsModule,
  ],
  templateUrl: './edit-estimation-dialog.component.html',
  styleUrl: './edit-estimation-dialog.component.scss',
})
export class EditEstimationDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditEstimationDialogComponent>);
  data = inject<{ estimation: Estimation }>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];
  comparisons: Comparison[] = [];
  comparisonColumns = ['target', 'comparator', 'outcomes', 'actions'];
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    type: [''],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.estimation.name,
      description: this.data.estimation.description || '',
      type: this.data.estimation.type,
    });

    this.tags = [...(this.data.estimation.tags || [])];
    this.comparisons = [...(this.data.estimation.comparisons || [])];

    this.originalValues = {
      ...this.form.value,
      tags: [...this.tags],
      comparisonCount: this.comparisons.length,
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

  addComparison(): void {
    this.comparisons.push({
      targetCohort: 'New Target Cohort',
      comparatorCohort: 'New Comparator Cohort',
      outcomes: [],
    });
  }

  removeComparison(index: number): void {
    this.comparisons.splice(index, 1);
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.type !== this.originalValues.type ||
      JSON.stringify(this.tags.sort()) !== JSON.stringify(this.originalValues.tags.sort()) ||
      this.comparisons.length !== this.originalValues.comparisonCount
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
      const updatedEstimation = {
        ...this.data.estimation,
        ...this.form.value,
        tags: this.tags,
        comparisons: this.comparisons,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedEstimation);
    }
  }
}

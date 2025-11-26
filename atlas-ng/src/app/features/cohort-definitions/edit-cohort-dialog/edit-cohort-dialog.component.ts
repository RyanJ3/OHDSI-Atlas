import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface CohortDefinition {
  id: number;
  name: string;
  description: string;
  expressionType: string;
  tags: string[];
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
}

@Component({
  selector: 'app-edit-cohort-dialog',
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
    MatChipsModule,
    MatTabsModule,
  ],
  templateUrl: './edit-cohort-dialog.component.html',
  styleUrl: './edit-cohort-dialog.component.scss',
})
export class EditCohortDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditCohortDialogComponent>);
  data = inject<{ cohort: CohortDefinition }>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    expressionType: ['SIMPLE_EXPRESSION'],
  });

  ngOnInit(): void {
    // Populate form with existing data
    this.form.patchValue({
      name: this.data.cohort.name,
      description: this.data.cohort.description,
      expressionType: this.data.cohort.expressionType,
    });
    this.tags = [...(this.data.cohort.tags || [])];

    // Store original values to detect changes
    this.originalValues = {
      name: this.data.cohort.name,
      description: this.data.cohort.description,
      expressionType: this.data.cohort.expressionType,
      tags: [...(this.data.cohort.tags || [])],
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

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.expressionType !== this.originalValues.expressionType ||
      JSON.stringify(this.tags.sort()) !== JSON.stringify(this.originalValues.tags.sort())
    );
  }

  save(): void {
    if (this.form.valid) {
      const updatedCohort = {
        ...this.data.cohort,
        ...this.form.value,
        tags: this.tags,
        modifiedDate: new Date(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedCohort);
    }
  }
}

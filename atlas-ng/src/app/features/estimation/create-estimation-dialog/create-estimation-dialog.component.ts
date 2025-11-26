import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-estimation-dialog',
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
    MatCheckboxModule,
  ],
  templateUrl: './create-estimation-dialog.component.html',
  styleUrl: './create-estimation-dialog.component.scss',
})
export class CreateEstimationDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateEstimationDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    studyType: ['COMPARATIVE_COHORT'],
    tarStart: [1],
    tarEnd: [365],
    usePropensityScore: [true],
    includeNegativeControls: [false],
  });

  create(): void {
    if (this.form.valid) {
      const estimation = {
        name: this.form.value.name,
        description: this.form.value.description,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        targetCohort: null,
        comparatorCohort: null,
        outcomes: [],
        studyType: this.form.value.studyType,
        timeAtRisk: {
          start: this.form.value.tarStart,
          end: this.form.value.tarEnd,
        },
        usePropensityScore: this.form.value.usePropensityScore,
        includeNegativeControls: this.form.value.includeNegativeControls,
        executions: [],
      };
      this.dialogRef.close(estimation);
    }
  }
}

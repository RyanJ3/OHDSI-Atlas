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
  selector: 'app-create-prediction-dialog',
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
  templateUrl: './create-prediction-dialog.component.html',
  styleUrl: './create-prediction-dialog.component.scss',
})
export class CreatePredictionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreatePredictionDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    modelType: ['LASSO_LOGISTIC_REGRESSION'],
    tarStart: [1],
    tarEnd: [365],
    minCovariateFraction: [0.001],
  });

  create(): void {
    if (this.form.valid) {
      const prediction = {
        name: this.form.value.name,
        description: this.form.value.description,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        targetCohort: null,
        outcomeCohort: null,
        modelType: this.form.value.modelType,
        timeAtRisk: {
          start: this.form.value.tarStart,
          end: this.form.value.tarEnd,
        },
        minCovariateFraction: this.form.value.minCovariateFraction,
        executions: [],
      };
      this.dialogRef.close(prediction);
    }
  }
}

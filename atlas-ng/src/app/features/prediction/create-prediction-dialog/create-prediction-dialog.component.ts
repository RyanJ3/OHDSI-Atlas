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
  template: `
    <h2 mat-dialog-title>
      <mat-icon>psychology</mat-icon>
      Create New Prediction Model
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter prediction model name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the prediction model..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="model-section">
          <div class="section-label">Model Configuration</div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Model Type</mat-label>
            <mat-select formControlName="modelType">
              <mat-option value="LASSO_LOGISTIC_REGRESSION">LASSO Logistic Regression</mat-option>
              <mat-option value="GRADIENT_BOOSTING">Gradient Boosting Machine</mat-option>
              <mat-option value="RANDOM_FOREST">Random Forest</mat-option>
              <mat-option value="DECISION_TREE">Decision Tree</mat-option>
              <mat-option value="NEURAL_NETWORK">Neural Network</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="settings-row">
            <mat-form-field appearance="outline">
              <mat-label>Time at Risk Start (days)</mat-label>
              <input matInput type="number" formControlName="tarStart" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time at Risk End (days)</mat-label>
              <input matInput type="number" formControlName="tarEnd" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Minimum Covariate Fraction</mat-label>
            <input matInput type="number" formControlName="minCovariateFraction" step="0.001" />
            <mat-hint>Minimum fraction of population with covariate (e.g., 0.001)</mat-hint>
          </mat-form-field>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating, you'll define target and outcome cohorts and configure covariate settings for training the prediction model.</span>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!form.valid"
        (click)="create()"
      >
        <mat-icon>add</mat-icon>
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      mat-icon { color: #5e35b1; }
    }

    mat-dialog-content {
      min-width: 550px;
      padding-top: 16px;
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .model-section {
      margin-top: 8px;

      .section-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }
    }

    .settings-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #ede7f6;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #5e35b1;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #4527a0;
        line-height: 1.5;
      }
    }

    mat-dialog-actions button mat-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
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

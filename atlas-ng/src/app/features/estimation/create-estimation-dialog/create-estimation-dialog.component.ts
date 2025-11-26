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
  template: `
    <h2 mat-dialog-title>
      <mat-icon>balance</mat-icon>
      Create New Estimation Study
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter estimation study name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the estimation study..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="study-section">
          <div class="section-label">Study Design</div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Study Type</mat-label>
            <mat-select formControlName="studyType">
              <mat-option value="COMPARATIVE_COHORT">Comparative Cohort Study</mat-option>
              <mat-option value="SELF_CONTROLLED_COHORT">Self-Controlled Cohort</mat-option>
              <mat-option value="CASE_CONTROL">Case-Control Study</mat-option>
              <mat-option value="CASE_CROSSOVER">Case-Crossover</mat-option>
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

          <div class="options-grid">
            <mat-checkbox formControlName="usePropensityScore">
              Use Propensity Score Matching
            </mat-checkbox>
            <mat-checkbox formControlName="includeNegativeControls">
              Include Negative Controls
            </mat-checkbox>
          </div>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating, you'll define target, comparator, and outcome cohorts to estimate the comparative effect.</span>
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
      mat-icon { color: #0277bd; }
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

    .study-section {
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

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e1f5fe;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #0277bd;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #01579b;
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

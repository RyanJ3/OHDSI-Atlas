import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-create-pathway-dialog',
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
    MatSliderModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>route</mat-icon>
      Create New Pathway Analysis
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter pathway analysis name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the pathway analysis..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="settings-section">
          <div class="section-label">Analysis Settings</div>

          <div class="settings-grid">
            <mat-form-field appearance="outline">
              <mat-label>Combination Window (days)</mat-label>
              <input matInput type="number" formControlName="combinationWindow" />
              <mat-hint>Days to combine events</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Minimum Cell Count</mat-label>
              <input matInput type="number" formControlName="minCellCount" />
              <mat-hint>Privacy threshold</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Max Depth</mat-label>
              <input matInput type="number" formControlName="maxDepth" />
              <mat-hint>Maximum pathway steps</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating, you'll define target cohorts and event cohorts that form the treatment pathways.</span>
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
      mat-icon { color: #00897b; }
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

    .settings-section {
      margin-top: 8px;

      .section-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e0f2f1;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #00897b;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #00695c;
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
export class CreatePathwayDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreatePathwayDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    combinationWindow: [0],
    minCellCount: [5],
    maxDepth: [5],
  });

  create(): void {
    if (this.form.valid) {
      const pathway = {
        name: this.form.value.name,
        description: this.form.value.description,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        targetCohorts: [],
        eventCohorts: [],
        combinationWindow: this.form.value.combinationWindow,
        minCellCount: this.form.value.minCellCount,
        maxDepth: this.form.value.maxDepth,
        executions: [],
      };
      this.dialogRef.close(pathway);
    }
  }
}

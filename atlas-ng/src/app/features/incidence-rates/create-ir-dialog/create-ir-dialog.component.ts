import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-ir-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>trending_up</mat-icon>
      Create New Incidence Rate Analysis
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter analysis name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the incidence rate analysis..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="time-at-risk-section">
          <div class="section-label">Time at Risk</div>
          <div class="tar-grid">
            <div class="tar-row">
              <span class="tar-label">Start:</span>
              <mat-form-field appearance="outline" class="tar-field">
                <input matInput type="number" formControlName="tarStartOffset" />
              </mat-form-field>
              <span class="tar-text">days</span>
              <mat-form-field appearance="outline" class="tar-field">
                <mat-select formControlName="tarStartAnchor">
                  <mat-option value="cohort start">after cohort start</mat-option>
                  <mat-option value="cohort end">after cohort end</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="tar-row">
              <span class="tar-label">End:</span>
              <mat-form-field appearance="outline" class="tar-field">
                <input matInput type="number" formControlName="tarEndOffset" />
              </mat-form-field>
              <span class="tar-text">days</span>
              <mat-form-field appearance="outline" class="tar-field">
                <mat-select formControlName="tarEndAnchor">
                  <mat-option value="cohort start">after cohort start</mat-option>
                  <mat-option value="cohort end">after cohort end</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating, you'll select target and outcome cohorts to calculate the incidence rate.</span>
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
      mat-icon { color: #f57c00; }
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

    .time-at-risk-section {
      margin-top: 8px;

      .section-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }
    }

    .tar-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
    }

    .tar-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .tar-label {
        width: 50px;
        font-weight: 500;
        color: #666;
      }

      .tar-field {
        width: 100px;

        &:last-child {
          width: 160px;
        }
      }

      .tar-text {
        font-size: 13px;
        color: #666;
      }
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fff3e0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #f57c00;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #e65100;
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
export class CreateIrDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateIrDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    tarStartOffset: [0],
    tarStartAnchor: ['cohort start'],
    tarEndOffset: [365],
    tarEndAnchor: ['cohort start'],
  });

  create(): void {
    if (this.form.valid) {
      const ir = {
        name: this.form.value.name,
        description: this.form.value.description,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        targetCohorts: [],
        outcomeCohorts: [],
        timeAtRisk: {
          start: {
            offset: this.form.value.tarStartOffset,
            anchor: this.form.value.tarStartAnchor,
          },
          end: {
            offset: this.form.value.tarEndOffset,
            anchor: this.form.value.tarEndAnchor,
          },
        },
        executions: [],
      };
      this.dialogRef.close(ir);
    }
  }
}

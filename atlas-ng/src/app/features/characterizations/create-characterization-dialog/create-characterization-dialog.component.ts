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
  selector: 'app-create-characterization-dialog',
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
      <mat-icon>bar_chart</mat-icon>
      Create New Characterization
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter characterization name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the characterization analysis..."
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="features-section">
          <div class="section-label">Default Feature Analyses</div>
          <div class="features-grid">
            @for (feature of defaultFeatures; track feature.id) {
              <mat-checkbox
                [checked]="selectedFeatures.includes(feature.id)"
                (change)="toggleFeature(feature.id, $event.checked)"
              >
                {{ feature.name }}
              </mat-checkbox>
            }
          </div>
        </div>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating, you'll select cohorts to characterize and configure additional feature analyses and stratification criteria.</span>
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
      mat-icon { color: #c2185b; }
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

    .features-section {
      margin-top: 8px;

      .section-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;

      mat-checkbox {
        font-size: 13px;
      }
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fce4ec;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #c2185b;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #880e4f;
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
export class CreateCharacterizationDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateCharacterizationDialogComponent>);

  defaultFeatures = [
    { id: 'demographics', name: 'Demographics' },
    { id: 'conditions', name: 'Condition Occurrence' },
    { id: 'drugs', name: 'Drug Exposure' },
    { id: 'procedures', name: 'Procedure Occurrence' },
    { id: 'measurements', name: 'Measurements' },
    { id: 'observations', name: 'Observations' },
    { id: 'visits', name: 'Visit Occurrence' },
    { id: 'charlson', name: 'Charlson Comorbidity Index' },
  ];

  selectedFeatures: string[] = ['demographics', 'conditions', 'drugs'];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  toggleFeature(featureId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedFeatures.includes(featureId)) {
        this.selectedFeatures.push(featureId);
      }
    } else {
      const index = this.selectedFeatures.indexOf(featureId);
      if (index >= 0) {
        this.selectedFeatures.splice(index, 1);
      }
    }
  }

  create(): void {
    if (this.form.valid) {
      const characterization = {
        ...this.form.value,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        cohorts: [],
        featureAnalyses: this.selectedFeatures.map(id => ({
          id: this.defaultFeatures.find(f => f.id === id)?.id,
          name: this.defaultFeatures.find(f => f.id === id)?.name,
          type: 'PRESET',
        })),
        stratas: [],
        executions: [],
      };
      this.dialogRef.close(characterization);
    }
  }
}

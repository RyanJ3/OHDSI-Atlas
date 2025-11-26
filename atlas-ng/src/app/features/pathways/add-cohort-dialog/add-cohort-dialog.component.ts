import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface Cohort {
  id: number;
  name: string;
}

export interface AddCohortDialogData {
  title: string;
  type: 'event' | 'target';
  existingCohortIds: number[];
}

export interface AddCohortDialogResult {
  cohort: Cohort;
}

@Component({
  selector: 'app-add-cohort-dialog',
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
    MatRadioModule,
    MatAutocompleteModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.type === 'event' ? 'event' : 'groups' }}</mat-icon>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <div class="add-mode-section">
        <mat-radio-group [(ngModel)]="addMode" class="add-mode-group">
          <mat-radio-button value="select">Select from existing cohorts</mat-radio-button>
          <mat-radio-button value="custom">Enter custom cohort</mat-radio-button>
        </mat-radio-group>
      </div>

      @if (addMode === 'select') {
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select Cohort</mat-label>
          <mat-select [(ngModel)]="selectedCohort">
            @for (cohort of availableCohorts; track cohort.id) {
              <mat-option [value]="cohort">
                <span class="cohort-option">
                  <span class="cohort-id">#{{ cohort.id }}</span>
                  {{ cohort.name }}
                </span>
              </mat-option>
            }
          </mat-select>
          @if (availableCohorts.length === 0) {
            <mat-hint>No available cohorts to add</mat-hint>
          }
        </mat-form-field>
      } @else {
        <form [formGroup]="customForm" class="custom-form">
          <mat-form-field appearance="outline" class="id-field">
            <mat-label>ID</mat-label>
            <input matInput type="number" formControlName="id" />
            @if (customForm.get('id')?.hasError('required')) {
              <mat-error>ID is required</mat-error>
            }
            @if (customForm.get('id')?.hasError('min')) {
              <mat-error>ID must be positive</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="name-field">
            <mat-label>Cohort Name</mat-label>
            <input matInput formControlName="name" />
            @if (customForm.get('name')?.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!canAdd()"
        (click)="add()"
      >
        <mat-icon>add</mat-icon>
        Add Cohort
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
      min-width: 450px;
      padding-top: 16px;
    }

    .add-mode-section {
      margin-bottom: 20px;
    }

    .add-mode-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .custom-form {
      display: flex;
      gap: 16px;
    }

    .id-field {
      width: 120px;
    }

    .name-field {
      flex: 1;
    }

    .cohort-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .cohort-id {
        font-size: 12px;
        color: #888;
        min-width: 40px;
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
export class AddCohortDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddCohortDialogComponent>);
  data = inject<AddCohortDialogData>(MAT_DIALOG_DATA);

  addMode: 'select' | 'custom' = 'select';
  selectedCohort: Cohort | null = null;
  availableCohorts: Cohort[] = [];

  customForm: FormGroup = this.fb.group({
    id: [null, [Validators.required, Validators.min(1)]],
    name: ['', Validators.required],
  });

  // Sample available cohorts (in production, these would come from an API)
  private allCohorts: Cohort[] = [
    { id: 301, name: 'Metformin' },
    { id: 302, name: 'Sulfonylureas' },
    { id: 303, name: 'DPP-4 Inhibitors' },
    { id: 304, name: 'GLP-1 Agonists' },
    { id: 305, name: 'SGLT2 Inhibitors' },
    { id: 306, name: 'Insulin' },
    { id: 307, name: 'ACE Inhibitors' },
    { id: 308, name: 'ARBs' },
    { id: 309, name: 'Calcium Channel Blockers' },
    { id: 310, name: 'Thiazide Diuretics' },
    { id: 311, name: 'Beta Blockers' },
    { id: 312, name: 'SSRIs' },
    { id: 313, name: 'SNRIs' },
    { id: 314, name: 'TCAs' },
    { id: 315, name: 'Bupropion' },
    { id: 316, name: 'Mirtazapine' },
    { id: 317, name: 'LABA' },
    { id: 318, name: 'LAMA' },
    { id: 319, name: 'ICS' },
    { id: 320, name: 'LABA/LAMA Combination' },
    { id: 321, name: 'Triple Therapy' },
    { id: 322, name: 'Methotrexate' },
    { id: 323, name: 'Hydroxychloroquine' },
    { id: 324, name: 'Sulfasalazine' },
    { id: 325, name: 'TNF Inhibitors' },
    { id: 326, name: 'JAK Inhibitors' },
    { id: 327, name: 'Tamoxifen' },
    { id: 328, name: 'Aromatase Inhibitors' },
    { id: 329, name: 'Trastuzumab' },
    { id: 330, name: 'CDK4/6 Inhibitors' },
    { id: 331, name: 'Chemotherapy' },
  ];

  ngOnInit(): void {
    // Filter out already existing cohorts
    this.availableCohorts = this.allCohorts.filter(
      cohort => !this.data.existingCohortIds.includes(cohort.id)
    );

    // Set default custom ID to next available
    const nextId = Math.max(...this.data.existingCohortIds, 0) + 1;
    this.customForm.patchValue({ id: nextId });
  }

  canAdd(): boolean {
    if (this.addMode === 'select') {
      return this.selectedCohort !== null;
    } else {
      return this.customForm.valid;
    }
  }

  add(): void {
    let cohort: Cohort;

    if (this.addMode === 'select' && this.selectedCohort) {
      cohort = this.selectedCohort;
    } else if (this.addMode === 'custom' && this.customForm.valid) {
      cohort = {
        id: this.customForm.value.id,
        name: this.customForm.value.name,
      };
    } else {
      return;
    }

    this.dialogRef.close({ cohort } as AddCohortDialogResult);
  }
}

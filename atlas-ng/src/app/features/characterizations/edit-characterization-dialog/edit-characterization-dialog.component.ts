import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Cohort {
  id: number;
  name: string;
}

interface FeatureAnalysis {
  id: number;
  name: string;
  type: 'PRESET' | 'CUSTOM';
}

interface Strata {
  id: number;
  name: string;
}

interface Characterization {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  cohorts: Cohort[];
  featureAnalyses: FeatureAnalysis[];
  stratas: Strata[];
  executions: any[];
}

@Component({
  selector: 'app-edit-characterization-dialog',
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
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>bar_chart</mat-icon>
      Edit Characterization
    </h2>

    <mat-dialog-content>
      <mat-tab-group>
        <!-- Definition Tab -->
        <mat-tab label="Definition">
          <form [formGroup]="form" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="id-field">
                <mat-label>ID</mat-label>
                <input matInput [value]="data.characterization.id" disabled />
              </mat-form-field>

              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
                @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="3"
              ></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- Cohorts Tab -->
        <mat-tab label="Cohorts">
          <div class="cohorts-tab">
            @if (data.characterization.cohorts.length > 0) {
              <table mat-table [dataSource]="data.characterization.cohorts" class="cohorts-table">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let cohort">{{ cohort.id }}</td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let cohort">{{ cohort.name }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let cohort">
                    <button mat-icon-button color="warn" (click)="removeCohort(cohort)" matTooltip="Remove">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="cohortColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: cohortColumns"></tr>
              </table>
            } @else {
              <div class="empty-state">
                <mat-icon>groups</mat-icon>
                <p>No cohorts selected</p>
                <p class="hint">Add cohorts to analyze their baseline characteristics</p>
              </div>
            }
            <div class="add-action">
              <button mat-stroked-button color="primary" (click)="addCohort()">
                <mat-icon>add</mat-icon>
                Add Cohort
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Features Tab -->
        <mat-tab label="Feature Analyses">
          <div class="features-tab">
            <div class="section-label">Selected Feature Analyses</div>
            <div class="features-grid">
              @for (feature of defaultFeatures; track feature.id) {
                <mat-checkbox
                  [checked]="isFeatureSelected(feature.id)"
                  (change)="toggleFeature(feature.id, $event.checked)"
                >
                  {{ feature.name }}
                </mat-checkbox>
              }
            </div>

            @if (getCustomFeatures().length > 0) {
              <div class="section-label">Custom Feature Analyses</div>
              <mat-chip-set>
                @for (feature of getCustomFeatures(); track feature.id) {
                  <mat-chip>{{ feature.name }}</mat-chip>
                }
              </mat-chip-set>
            }

            <div class="add-action">
              <button mat-stroked-button color="primary" (click)="addCustomFeature()">
                <mat-icon>add</mat-icon>
                Add Custom Feature Analysis
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Stratas Tab -->
        <mat-tab label="Stratification">
          <div class="stratas-tab">
            @if (stratas.length > 0) {
              <div class="strata-list">
                @for (strata of stratas; track strata.id) {
                  <div class="strata-item">
                    <mat-icon>layers</mat-icon>
                    <span class="strata-name">{{ strata.name }}</span>
                    <button mat-icon-button color="warn" (click)="removeStrata(strata)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>layers</mat-icon>
                <p>No stratification criteria defined</p>
                <p class="hint">Add stratas to segment your analysis</p>
              </div>
            }
            <div class="add-action">
              <button mat-stroked-button color="primary" (click)="addStrata()">
                <mat-icon>add</mat-icon>
                Add Stratification Criteria
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Metadata Tab -->
        <mat-tab label="Metadata">
          <div class="metadata-tab">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Created By</span>
                <span class="value">{{ data.characterization.createdBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Created Date</span>
                <span class="value">{{ formatDate(data.characterization.createdDate) }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Modified By</span>
                <span class="value">{{ data.characterization.modifiedBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Last Modified</span>
                <span class="value">{{ formatDate(data.characterization.modifiedDate) }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Total Cohorts</span>
                <span class="value">{{ data.characterization.cohorts.length }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Feature Analyses</span>
                <span class="value">{{ data.characterization.featureAnalyses.length }}</span>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!form.valid || !hasChanges()"
        (click)="save()"
      >
        <mat-icon>save</mat-icon>
        Save Changes
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
      min-width: 700px;
      max-height: 70vh;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .id-field {
      width: 100px;
    }

    .name-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .cohorts-tab, .features-tab, .stratas-tab {
      padding: 16px 0;
    }

    .cohorts-table {
      width: 100%;

      th {
        background: #fafafa;
        font-weight: 600;
        font-size: 12px;
      }

      td {
        font-size: 13px;
      }
    }

    .section-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 16px;

      mat-checkbox {
        font-size: 13px;
      }
    }

    .strata-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .strata-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;

      mat-icon {
        color: #9c27b0;
      }

      .strata-name {
        flex: 1;
        font-size: 14px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #888;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        margin: 0;
      }

      .hint {
        font-size: 12px;
        margin-top: 8px;
      }
    }

    .add-action {
      margin-top: 16px;

      button mat-icon {
        margin-right: 6px;
      }
    }

    .metadata-tab {
      padding: 24px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .metadata-item {
      .label {
        display: block;
        font-size: 12px;
        color: #888;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      .value {
        display: block;
        font-size: 14px;
        color: #333;
        font-weight: 500;
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
export class EditCharacterizationDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditCharacterizationDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data = inject<{ characterization: Characterization }>(MAT_DIALOG_DATA);

  cohortColumns = ['id', 'name', 'actions'];
  originalValues: any;
  selectedFeatureIds: string[] = [];
  stratas: Strata[] = [];

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

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    // Populate form with existing data
    this.form.patchValue({
      name: this.data.characterization.name,
      description: this.data.characterization.description || '',
    });

    // Map feature analyses to selected IDs
    this.selectedFeatureIds = this.data.characterization.featureAnalyses
      .filter(f => f.type === 'PRESET')
      .map(f => this.mapFeatureNameToId(f.name));

    // Copy stratas
    this.stratas = [...this.data.characterization.stratas];

    // Store original values
    this.originalValues = {
      name: this.data.characterization.name,
      description: this.data.characterization.description || '',
      featureIds: [...this.selectedFeatureIds],
      strataCount: this.stratas.length,
      cohortCount: this.data.characterization.cohorts.length,
    };
  }

  private mapFeatureNameToId(name: string): string {
    const featureMap: { [key: string]: string } = {
      'Demographics': 'demographics',
      'Condition Occurrence': 'conditions',
      'Drug Exposure': 'drugs',
      'Procedure Occurrence': 'procedures',
      'Measurements': 'measurements',
      'Observations': 'observations',
      'Visit Occurrence': 'visits',
      'Charlson Comorbidity Index': 'charlson',
    };
    return featureMap[name] || name.toLowerCase();
  }

  isFeatureSelected(featureId: string): boolean {
    return this.selectedFeatureIds.includes(featureId);
  }

  toggleFeature(featureId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedFeatureIds.includes(featureId)) {
        this.selectedFeatureIds.push(featureId);
      }
    } else {
      const index = this.selectedFeatureIds.indexOf(featureId);
      if (index >= 0) {
        this.selectedFeatureIds.splice(index, 1);
      }
    }
  }

  getCustomFeatures(): FeatureAnalysis[] {
    return this.data.characterization.featureAnalyses.filter(f => f.type === 'CUSTOM');
  }

  removeCohort(cohort: Cohort): void {
    const index = this.data.characterization.cohorts.findIndex(c => c.id === cohort.id);
    if (index >= 0) {
      this.data.characterization.cohorts.splice(index, 1);
    }
  }

  addCohort(): void {
    // Demo: Add a sample cohort
    const newId = Math.max(...this.data.characterization.cohorts.map(c => c.id), 0) + 1;
    this.data.characterization.cohorts.push({
      id: newId,
      name: `New Cohort ${newId}`,
    });
  }

  removeStrata(strata: Strata): void {
    const index = this.stratas.findIndex(s => s.id === strata.id);
    if (index >= 0) {
      this.stratas.splice(index, 1);
    }
  }

  addStrata(): void {
    const newId = Math.max(...this.stratas.map(s => s.id), 0) + 1;
    this.stratas.push({
      id: newId,
      name: `New Stratification ${newId}`,
    });
  }

  addCustomFeature(): void {
    // Demo: Would open a custom feature dialog
    this.snackBar.open('Custom feature analysis dialog would open here', 'OK', { duration: 3000 });
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      JSON.stringify(this.selectedFeatureIds.sort()) !== JSON.stringify(this.originalValues.featureIds.sort()) ||
      this.stratas.length !== this.originalValues.strataCount ||
      this.data.characterization.cohorts.length !== this.originalValues.cohortCount
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
      const updatedCharacterization = {
        ...this.data.characterization,
        ...this.form.value,
        featureAnalyses: [
          ...this.selectedFeatureIds.map(id => ({
            id: this.defaultFeatures.find(f => f.id === id)?.id,
            name: this.defaultFeatures.find(f => f.id === id)?.name,
            type: 'PRESET' as const,
          })),
          ...this.getCustomFeatures(),
        ],
        stratas: this.stratas,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedCharacterization);
    }
  }
}

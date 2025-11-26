import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface Cohort {
  id: number;
  name: string;
}

interface PathwayAnalysis {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  targetCohorts: Cohort[];
  eventCohorts: Cohort[];
  combinationWindow: number;
  minCellCount: number;
  maxDepth: number;
  allowRepeats: boolean;
  executions: any[];
}

@Component({
  selector: 'app-edit-pathway-dialog',
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
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>route</mat-icon>
      Edit Pathway Analysis
    </h2>

    <mat-dialog-content>
      <mat-tab-group>
        <!-- Definition Tab -->
        <mat-tab label="Definition">
          <form [formGroup]="form" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="id-field">
                <mat-label>ID</mat-label>
                <input matInput [value]="data.analysis.id" disabled />
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

        <!-- Target Cohorts Tab -->
        <mat-tab label="Target Cohorts">
          <div class="cohorts-tab">
            <p class="tab-description">Target cohorts define the population to analyze for treatment pathways.</p>
            @if (targetCohorts.length > 0) {
              <table mat-table [dataSource]="targetCohorts" class="cohorts-table">
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
                    <button mat-icon-button color="warn" (click)="removeTargetCohort(cohort)">
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
                <p>No target cohorts defined</p>
              </div>
            }
            <div class="add-action">
              <button mat-stroked-button color="primary" (click)="addTargetCohort()">
                <mat-icon>add</mat-icon>
                Add Target Cohort
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Event Cohorts Tab -->
        <mat-tab label="Event Cohorts">
          <div class="cohorts-tab">
            <p class="tab-description">Event cohorts represent the treatments or events that form pathways.</p>
            @if (eventCohorts.length > 0) {
              <table mat-table [dataSource]="eventCohorts" class="cohorts-table">
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
                    <button mat-icon-button color="warn" (click)="removeEventCohort(cohort)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="cohortColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: cohortColumns"></tr>
              </table>
            } @else {
              <div class="empty-state">
                <mat-icon>event</mat-icon>
                <p>No event cohorts defined</p>
              </div>
            }
            <div class="add-action">
              <button mat-stroked-button color="primary" (click)="addEventCohort()">
                <mat-icon>add</mat-icon>
                Add Event Cohort
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Settings Tab -->
        <mat-tab label="Settings">
          <form [formGroup]="form" class="settings-tab">
            <div class="settings-grid">
              <mat-form-field appearance="outline">
                <mat-label>Combination Window (days)</mat-label>
                <input matInput type="number" formControlName="combinationWindow" />
                <mat-hint>Days to combine concurrent events</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Minimum Cell Count</mat-label>
                <input matInput type="number" formControlName="minCellCount" />
                <mat-hint>Privacy threshold for counts</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max Depth</mat-label>
                <input matInput type="number" formControlName="maxDepth" />
                <mat-hint>Maximum pathway steps</mat-hint>
              </mat-form-field>
            </div>

            <div class="toggle-option">
              <mat-slide-toggle formControlName="allowRepeats">
                Allow Repeats
              </mat-slide-toggle>
              <span class="toggle-hint">Allow the same event to appear multiple times in a pathway</span>
            </div>
          </form>
        </mat-tab>

        <!-- Metadata Tab -->
        <mat-tab label="Metadata">
          <div class="metadata-tab">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Created By</span>
                <span class="value">{{ data.analysis.createdBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Created Date</span>
                <span class="value">{{ formatDate(data.analysis.createdDate) }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Modified By</span>
                <span class="value">{{ data.analysis.modifiedBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Last Modified</span>
                <span class="value">{{ formatDate(data.analysis.modifiedDate) }}</span>
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
      mat-icon { color: #00897b; }
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

    .cohorts-tab, .settings-tab {
      padding: 16px 0;
    }

    .tab-description {
      color: #666;
      font-size: 13px;
      margin-bottom: 16px;
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .toggle-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;

      .toggle-hint {
        font-size: 12px;
        color: #888;
        margin-left: 48px;
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
export class EditPathwayDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPathwayDialogComponent>);
  data = inject<{ analysis: PathwayAnalysis }>(MAT_DIALOG_DATA);

  cohortColumns = ['id', 'name', 'actions'];
  targetCohorts: Cohort[] = [];
  eventCohorts: Cohort[] = [];
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    combinationWindow: [0],
    minCellCount: [5],
    maxDepth: [5],
    allowRepeats: [false],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.analysis.name,
      description: this.data.analysis.description || '',
      combinationWindow: this.data.analysis.combinationWindow,
      minCellCount: this.data.analysis.minCellCount,
      maxDepth: this.data.analysis.maxDepth,
      allowRepeats: this.data.analysis.allowRepeats,
    });

    this.targetCohorts = [...this.data.analysis.targetCohorts];
    this.eventCohorts = [...this.data.analysis.eventCohorts];

    this.originalValues = {
      ...this.form.value,
      targetCohortCount: this.targetCohorts.length,
      eventCohortCount: this.eventCohorts.length,
    };
  }

  removeTargetCohort(cohort: Cohort): void {
    const index = this.targetCohorts.findIndex(c => c.id === cohort.id);
    if (index >= 0) {
      this.targetCohorts.splice(index, 1);
    }
  }

  addTargetCohort(): void {
    const newId = Math.max(...this.targetCohorts.map(c => c.id), 0) + 1;
    this.targetCohorts.push({
      id: newId,
      name: `New Target Cohort ${newId}`,
    });
  }

  removeEventCohort(cohort: Cohort): void {
    const index = this.eventCohorts.findIndex(c => c.id === cohort.id);
    if (index >= 0) {
      this.eventCohorts.splice(index, 1);
    }
  }

  addEventCohort(): void {
    const newId = Math.max(...this.eventCohorts.map(c => c.id), 0) + 1;
    this.eventCohorts.push({
      id: newId,
      name: `New Event Cohort ${newId}`,
    });
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.combinationWindow !== this.originalValues.combinationWindow ||
      formValue.minCellCount !== this.originalValues.minCellCount ||
      formValue.maxDepth !== this.originalValues.maxDepth ||
      formValue.allowRepeats !== this.originalValues.allowRepeats ||
      this.targetCohorts.length !== this.originalValues.targetCohortCount ||
      this.eventCohorts.length !== this.originalValues.eventCohortCount
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
      const updatedAnalysis = {
        ...this.data.analysis,
        ...this.form.value,
        targetCohorts: this.targetCohorts,
        eventCohorts: this.eventCohorts,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedAnalysis);
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface CohortDefinition {
  id: number;
  name: string;
  description: string;
  expressionType: string;
  tags: string[];
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
}

@Component({
  selector: 'app-edit-cohort-dialog',
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
    MatChipsModule,
    MatTabsModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Edit Cohort Definition
    </h2>

    <mat-dialog-content>
      <mat-tab-group>
        <!-- Definition Tab -->
        <mat-tab label="Definition">
          <form [formGroup]="form" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="id-field">
                <mat-label>ID</mat-label>
                <input matInput [value]="data.cohort.id" disabled />
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

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Expression Type</mat-label>
              <mat-select formControlName="expressionType">
                <mat-option value="SIMPLE_EXPRESSION">Simple Expression</mat-option>
                <mat-option value="CUSTOM_EXPRESSION">Custom Expression</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="tags-section">
              <mat-label>Tags</mat-label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-chip-grid #chipGrid>
                  @for (tag of tags; track tag) {
                    <mat-chip-row (removed)="removeTag(tag)">
                      {{ tag }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                </mat-chip-grid>
                <input
                  placeholder="Add tag..."
                  [matChipInputFor]="chipGrid"
                  [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
                  (matChipInputTokenEnd)="addTag($event)"
                />
              </mat-form-field>
            </div>
          </form>
        </mat-tab>

        <!-- Expression Tab -->
        <mat-tab label="Expression">
          <div class="expression-tab">
            <div class="expression-placeholder">
              <mat-icon>code</mat-icon>
              <h3>Cohort Expression Builder</h3>
              <p>The full expression builder would allow defining:</p>
              <ul>
                <li>Primary criteria (initial events)</li>
                <li>Additional qualifying criteria</li>
                <li>Inclusion rules</li>
                <li>Censoring criteria</li>
                <li>Concept sets</li>
              </ul>
              <p class="note">This is a demo interface - full expression editing requires the complete ATLAS cohort builder.</p>
            </div>
          </div>
        </mat-tab>

        <!-- Metadata Tab -->
        <mat-tab label="Metadata">
          <div class="metadata-tab">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Created By</span>
                <span class="value">{{ data.cohort.createdBy }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Created Date</span>
                <span class="value">{{ data.cohort.createdDate | date:'medium' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Last Modified</span>
                <span class="value">{{ data.cohort.modifiedDate | date:'medium' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Expression Type</span>
                <span class="value">{{ data.cohort.expressionType }}</span>
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
      mat-icon { color: #1976d2; }
    }

    mat-dialog-content {
      min-width: 600px;
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

    .tags-section {
      mat-label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        color: #666;
      }
    }

    .expression-tab {
      padding: 24px;
    }

    .expression-placeholder {
      text-align: center;
      padding: 40px;
      background: #f5f5f5;
      border-radius: 8px;
      border: 2px dashed #ddd;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #9e9e9e;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 16px 0;
        color: #333;
      }

      p {
        color: #666;
        margin: 0 0 12px 0;
      }

      ul {
        text-align: left;
        display: inline-block;
        margin: 0 0 16px 0;
        color: #666;

        li {
          margin: 4px 0;
        }
      }

      .note {
        font-size: 12px;
        font-style: italic;
        color: #999;
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
export class EditCohortDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditCohortDialogComponent>);
  data = inject<{ cohort: CohortDefinition }>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    expressionType: ['SIMPLE_EXPRESSION'],
  });

  ngOnInit(): void {
    // Populate form with existing data
    this.form.patchValue({
      name: this.data.cohort.name,
      description: this.data.cohort.description,
      expressionType: this.data.cohort.expressionType,
    });
    this.tags = [...(this.data.cohort.tags || [])];

    // Store original values to detect changes
    this.originalValues = {
      name: this.data.cohort.name,
      description: this.data.cohort.description,
      expressionType: this.data.cohort.expressionType,
      tags: [...(this.data.cohort.tags || [])],
    };
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.expressionType !== this.originalValues.expressionType ||
      JSON.stringify(this.tags.sort()) !== JSON.stringify(this.originalValues.tags.sort())
    );
  }

  save(): void {
    if (this.form.valid) {
      const updatedCohort = {
        ...this.data.cohort,
        ...this.form.value,
        tags: this.tags,
        modifiedDate: new Date(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedCohort);
    }
  }
}

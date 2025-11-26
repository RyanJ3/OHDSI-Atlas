import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-cohort-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>group_add</mat-icon>
      Create New Cohort Definition
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter cohort name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the cohort definition..."
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

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <span>After creating the cohort, you'll be able to define the inclusion criteria and concept sets.</span>
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
      mat-icon { color: #388e3c; }
    }

    mat-dialog-content {
      min-width: 500px;
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

    .tags-section {
      mat-label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        color: #666;
      }
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e3f2fd;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      mat-icon {
        color: #1976d2;
        flex-shrink: 0;
      }

      span {
        font-size: 13px;
        color: #1565c0;
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
export class CreateCohortDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateCohortDialogComponent>);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    expressionType: ['SIMPLE_EXPRESSION'],
  });

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

  create(): void {
    if (this.form.valid) {
      const cohort = {
        ...this.form.value,
        tags: this.tags,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
      };
      this.dialogRef.close(cohort);
    }
  }
}

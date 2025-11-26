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
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface ConceptSet {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  tags?: string[];
  concepts?: ConceptItem[];
}

interface ConceptItem {
  conceptId: number;
  conceptName: string;
  domainId: string;
  vocabularyId: string;
  conceptCode: string;
  isExcluded: boolean;
  includeDescendants: boolean;
  includeMapped: boolean;
}

@Component({
  selector: 'app-edit-concept-set-dialog',
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
    MatTableModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>shopping_cart</mat-icon>
      Edit Concept Set
    </h2>

    <mat-dialog-content>
      <mat-tab-group>
        <!-- Definition Tab -->
        <mat-tab label="Definition">
          <form [formGroup]="form" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="id-field">
                <mat-label>ID</mat-label>
                <input matInput [value]="data.conceptSet.id" disabled />
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

        <!-- Concepts Tab -->
        <mat-tab label="Concepts">
          <div class="concepts-tab">
            @if (mockConcepts.length > 0) {
              <table mat-table [dataSource]="mockConcepts" class="concepts-table">
                <ng-container matColumnDef="conceptName">
                  <th mat-header-cell *matHeaderCellDef>Concept Name</th>
                  <td mat-cell *matCellDef="let item">{{ item.conceptName }}</td>
                </ng-container>

                <ng-container matColumnDef="domainId">
                  <th mat-header-cell *matHeaderCellDef>Domain</th>
                  <td mat-cell *matCellDef="let item">{{ item.domainId }}</td>
                </ng-container>

                <ng-container matColumnDef="vocabularyId">
                  <th mat-header-cell *matHeaderCellDef>Vocabulary</th>
                  <td mat-cell *matCellDef="let item">{{ item.vocabularyId }}</td>
                </ng-container>

                <ng-container matColumnDef="isExcluded">
                  <th mat-header-cell *matHeaderCellDef>Excluded</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-checkbox [checked]="item.isExcluded" disabled></mat-checkbox>
                  </td>
                </ng-container>

                <ng-container matColumnDef="includeDescendants">
                  <th mat-header-cell *matHeaderCellDef>Descendants</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-checkbox [checked]="item.includeDescendants" disabled></mat-checkbox>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="conceptColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: conceptColumns"></tr>
              </table>
            } @else {
              <div class="empty-concepts">
                <mat-icon>category</mat-icon>
                <p>No concepts defined yet.</p>
                <p class="hint">Use the vocabulary search to add concepts to this set.</p>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Metadata Tab -->
        <mat-tab label="Metadata">
          <div class="metadata-tab">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Created By</span>
                <span class="value">{{ data.conceptSet.createdBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Created Date</span>
                <span class="value">{{ formatDate(data.conceptSet.createdDate) }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Modified By</span>
                <span class="value">{{ data.conceptSet.modifiedBy || 'Unknown' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Last Modified</span>
                <span class="value">{{ formatDate(data.conceptSet.modifiedDate) }}</span>
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
      mat-icon { color: #f57c00; }
    }

    mat-dialog-content {
      min-width: 650px;
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

    .concepts-tab {
      padding: 16px 0;
    }

    .concepts-table {
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

    .empty-concepts {
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
export class EditConceptSetDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditConceptSetDialogComponent>);
  data = inject<{ conceptSet: ConceptSet }>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];
  originalValues: any;
  conceptColumns = ['conceptName', 'domainId', 'vocabularyId', 'isExcluded', 'includeDescendants'];

  // Mock concepts for demonstration
  mockConcepts: ConceptItem[] = [
    { conceptId: 201826, conceptName: 'Type 2 diabetes mellitus', domainId: 'Condition', vocabularyId: 'SNOMED', conceptCode: '44054006', isExcluded: false, includeDescendants: true, includeMapped: false },
    { conceptId: 313217, conceptName: 'Atrial fibrillation', domainId: 'Condition', vocabularyId: 'SNOMED', conceptCode: '49436004', isExcluded: false, includeDescendants: true, includeMapped: false },
    { conceptId: 316139, conceptName: 'Heart failure', domainId: 'Condition', vocabularyId: 'SNOMED', conceptCode: '84114007', isExcluded: false, includeDescendants: true, includeMapped: false },
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    // Populate form with existing data
    this.form.patchValue({
      name: this.data.conceptSet.name,
      description: this.data.conceptSet.description || '',
    });
    this.tags = [...(this.data.conceptSet.tags || [])];

    // Store original values
    this.originalValues = {
      name: this.data.conceptSet.name,
      description: this.data.conceptSet.description || '',
      tags: [...(this.data.conceptSet.tags || [])],
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
      JSON.stringify(this.tags.sort()) !== JSON.stringify(this.originalValues.tags.sort())
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
      const updatedConceptSet = {
        ...this.data.conceptSet,
        ...this.form.value,
        tags: this.tags,
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedConceptSet);
    }
  }
}

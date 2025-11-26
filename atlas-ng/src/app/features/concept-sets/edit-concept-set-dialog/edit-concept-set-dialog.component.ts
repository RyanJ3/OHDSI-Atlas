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
  templateUrl: './edit-concept-set-dialog.component.html',
  styleUrl: './edit-concept-set-dialog.component.scss',
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

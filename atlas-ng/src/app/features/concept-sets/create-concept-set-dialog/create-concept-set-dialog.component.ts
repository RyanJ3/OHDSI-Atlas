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
  selector: 'app-create-concept-set-dialog',
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
  templateUrl: './create-concept-set-dialog.component.html',
  styleUrl: './create-concept-set-dialog.component.scss',
})
export class CreateConceptSetDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateConceptSetDialogComponent>);

  separatorKeyCodes = [ENTER, COMMA];
  tags: string[] = [];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    domain: [''],
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
      const conceptSet = {
        ...this.form.value,
        tags: this.tags,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        conceptCount: 0,
      };
      this.dialogRef.close(conceptSet);
    }
  }
}

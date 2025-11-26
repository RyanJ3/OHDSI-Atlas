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
  templateUrl: './create-ir-dialog.component.html',
  styleUrl: './create-ir-dialog.component.scss',
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

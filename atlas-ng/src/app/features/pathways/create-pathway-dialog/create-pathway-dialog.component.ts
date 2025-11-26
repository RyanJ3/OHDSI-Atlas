import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-create-pathway-dialog',
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
    MatSliderModule,
  ],
  templateUrl: './create-pathway-dialog.component.html',
  styleUrl: './create-pathway-dialog.component.scss',
})
export class CreatePathwayDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreatePathwayDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    combinationWindow: [0],
    minCellCount: [5],
    maxDepth: [5],
  });

  create(): void {
    if (this.form.valid) {
      const pathway = {
        name: this.form.value.name,
        description: this.form.value.description,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        targetCohorts: [],
        eventCohorts: [],
        combinationWindow: this.form.value.combinationWindow,
        minCellCount: this.form.value.minCellCount,
        maxDepth: this.form.value.maxDepth,
        executions: [],
      };
      this.dialogRef.close(pathway);
    }
  }
}

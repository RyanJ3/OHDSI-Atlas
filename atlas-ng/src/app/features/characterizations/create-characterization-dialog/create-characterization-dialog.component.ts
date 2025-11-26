import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-characterization-dialog',
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
  ],
  templateUrl: './create-characterization-dialog.component.html',
  styleUrl: './create-characterization-dialog.component.scss',
})
export class CreateCharacterizationDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateCharacterizationDialogComponent>);

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

  selectedFeatures: string[] = ['demographics', 'conditions', 'drugs'];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  toggleFeature(featureId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedFeatures.includes(featureId)) {
        this.selectedFeatures.push(featureId);
      }
    } else {
      const index = this.selectedFeatures.indexOf(featureId);
      if (index >= 0) {
        this.selectedFeatures.splice(index, 1);
      }
    }
  }

  create(): void {
    if (this.form.valid) {
      const characterization = {
        ...this.form.value,
        id: Math.floor(Math.random() * 10000) + 100,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'demo',
        modifiedBy: 'demo',
        cohorts: [],
        featureAnalyses: this.selectedFeatures.map(id => ({
          id: this.defaultFeatures.find(f => f.id === id)?.id,
          name: this.defaultFeatures.find(f => f.id === id)?.name,
          type: 'PRESET',
        })),
        stratas: [],
        executions: [],
      };
      this.dialogRef.close(characterization);
    }
  }
}

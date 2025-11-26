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
  templateUrl: './edit-characterization-dialog.component.html',
  styleUrl: './edit-characterization-dialog.component.scss',
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

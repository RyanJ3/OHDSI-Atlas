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

interface Cohort {
  id: number;
  name: string;
}

interface TimeAtRiskPoint {
  offset: number;
  anchor: string;
}

interface TimeAtRisk {
  start: TimeAtRiskPoint;
  end: TimeAtRiskPoint;
}

interface IncidenceRateAnalysis {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  targetCohorts: Cohort[];
  outcomeCohorts: Cohort[];
  timeAtRisk: TimeAtRisk;
  executions: any[];
}

@Component({
  selector: 'app-edit-ir-dialog',
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
  ],
  templateUrl: './edit-ir-dialog.component.html',
  styleUrl: './edit-ir-dialog.component.scss',
})
export class EditIrDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditIrDialogComponent>);
  data = inject<{ analysis: IncidenceRateAnalysis }>(MAT_DIALOG_DATA);

  cohortColumns = ['id', 'name', 'actions'];
  targetCohorts: Cohort[] = [];
  outcomeCohorts: Cohort[] = [];
  originalValues: any;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    tarStartOffset: [0],
    tarStartAnchor: ['cohort start'],
    tarEndOffset: [365],
    tarEndAnchor: ['cohort start'],
  });

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.analysis.name,
      description: this.data.analysis.description || '',
      tarStartOffset: this.data.analysis.timeAtRisk?.start?.offset || 0,
      tarStartAnchor: this.data.analysis.timeAtRisk?.start?.anchor || 'cohort start',
      tarEndOffset: this.data.analysis.timeAtRisk?.end?.offset || 365,
      tarEndAnchor: this.data.analysis.timeAtRisk?.end?.anchor || 'cohort start',
    });

    this.targetCohorts = [...(this.data.analysis.targetCohorts || [])];
    this.outcomeCohorts = [...(this.data.analysis.outcomeCohorts || [])];

    this.originalValues = {
      ...this.form.value,
      targetCohortCount: this.targetCohorts.length,
      outcomeCohortCount: this.outcomeCohorts.length,
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

  removeOutcomeCohort(cohort: Cohort): void {
    const index = this.outcomeCohorts.findIndex(c => c.id === cohort.id);
    if (index >= 0) {
      this.outcomeCohorts.splice(index, 1);
    }
  }

  addOutcomeCohort(): void {
    const newId = Math.max(...this.outcomeCohorts.map(c => c.id), 0) + 1;
    this.outcomeCohorts.push({
      id: newId,
      name: `New Outcome Cohort ${newId}`,
    });
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.name !== this.originalValues.name ||
      formValue.description !== this.originalValues.description ||
      formValue.tarStartOffset !== this.originalValues.tarStartOffset ||
      formValue.tarStartAnchor !== this.originalValues.tarStartAnchor ||
      formValue.tarEndOffset !== this.originalValues.tarEndOffset ||
      formValue.tarEndAnchor !== this.originalValues.tarEndAnchor ||
      this.targetCohorts.length !== this.originalValues.targetCohortCount ||
      this.outcomeCohorts.length !== this.originalValues.outcomeCohortCount
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
        name: this.form.value.name,
        description: this.form.value.description,
        targetCohorts: this.targetCohorts,
        outcomeCohorts: this.outcomeCohorts,
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
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'demo',
      };
      this.dialogRef.close(updatedAnalysis);
    }
  }
}

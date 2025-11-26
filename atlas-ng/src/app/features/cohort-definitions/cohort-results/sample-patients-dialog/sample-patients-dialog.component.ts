import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

// Import mock data
import samplePatientsData from '../../../../core/mock-data/sample-patients.json';

interface SamplePatient {
  personId: number;
  gender: string;
  birthYear: number;
  age: number;
  race: string;
  ethnicity: string;
  cohortStartDate: string;
  cohortEndDate: string;
}

interface DialogData {
  cohortId: number;
  cohortName: string;
  sourceKey: string;
  sourceName: string;
  personCount: number;
}

@Component({
  selector: 'app-sample-patients-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatChipsModule,
  ],
  templateUrl: './sample-patients-dialog.component.html',
  styleUrl: './sample-patients-dialog.component.scss',
})
export class SamplePatientsDialogComponent {
  private dialogRef = inject(MatDialogRef<SamplePatientsDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  patients: SamplePatient[] = [];
  displayedColumns = ['personId', 'gender', 'age', 'race', 'cohortStartDate', 'cohortEndDate'];

  pageSize = 10;
  pageIndex = 0;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // Load sample patients from mock data
    this.patients = samplePatientsData as SamplePatient[];
  }

  get pagedPatients(): SamplePatient[] {
    const start = this.pageIndex * this.pageSize;
    return this.patients.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getGenderIcon(gender: string): string {
    return gender === 'Female' ? 'fas fa-venus' : 'fas fa-mars';
  }

  getGenderClass(gender: string): string {
    return gender.toLowerCase();
  }

  close(): void {
    this.dialogRef.close();
  }

  viewProfile(patient: SamplePatient): void {
    // In a real app, this would navigate to the patient profile
    console.log('View profile for patient:', patient.personId);
  }
}

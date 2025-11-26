import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Reusable {
  id: number;
  name: string;
  type: 'Cohort' | 'Concept Set' | 'Analysis';
  description: string;
  usageCount: number;
  createdBy: string;
  modifiedDate: string;
}

@Component({
  selector: 'app-reusables',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './reusables.component.html',
  styleUrl: './reusables.component.scss',
})
export class ReusablesComponent implements OnInit {
  loading = signal(true);
  reusables = signal<Reusable[]>([]);
  filteredReusables = signal<Reusable[]>([]);
  searchFilter = '';
  selectedTab = 0;

  mockData: Reusable[] = [
    { id: 1, name: 'Type 2 Diabetes Patients', type: 'Cohort', description: 'Patients with T2DM diagnosis', usageCount: 15, createdBy: 'admin', modifiedDate: '2024-10-15' },
    { id: 2, name: 'Cardiovascular Conditions', type: 'Concept Set', description: 'CV-related diagnoses', usageCount: 28, createdBy: 'demo', modifiedDate: '2024-09-20' },
    { id: 3, name: 'Drug Exposure Analysis', type: 'Analysis', description: 'Standard drug exposure characterization', usageCount: 12, createdBy: 'researcher1', modifiedDate: '2024-11-01' },
    { id: 4, name: 'Heart Failure Cohort', type: 'Cohort', description: 'HF hospitalization patients', usageCount: 8, createdBy: 'admin', modifiedDate: '2024-08-30' },
    { id: 5, name: 'Statin Medications', type: 'Concept Set', description: 'All statin drug concepts', usageCount: 22, createdBy: 'demo', modifiedDate: '2024-10-05' },
    { id: 6, name: 'Baseline Characteristics', type: 'Analysis', description: 'Demographics and comorbidities', usageCount: 35, createdBy: 'admin', modifiedDate: '2024-09-15' },
  ];

  displayedColumns = ['name', 'type', 'usageCount', 'modifiedDate', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.reusables.set(this.mockData);
      this.applyFilters();
      this.loading.set(false);
    }, 300);
  }

  applyFilters(): void {
    const search = this.searchFilter.toLowerCase();
    let filtered = this.reusables();

    if (this.selectedTab === 1) {
      filtered = filtered.filter((r) => r.type === 'Cohort');
    } else if (this.selectedTab === 2) {
      filtered = filtered.filter((r) => r.type === 'Concept Set');
    } else if (this.selectedTab === 3) {
      filtered = filtered.filter((r) => r.type === 'Analysis');
    }

    if (search) {
      filtered = filtered.filter(
        (r) => r.name.toLowerCase().includes(search) || r.description.toLowerCase().includes(search)
      );
    }

    this.filteredReusables.set(filtered);
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.applyFilters();
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Cohort': return 'fas fa-users';
      case 'Concept Set': return 'fas fa-shopping-cart';
      case 'Analysis': return 'fas fa-chart-bar';
      default: return 'fas fa-file';
    }
  }

  useReusable(item: Reusable): void {
    this.snackBar.open(`Using "${item.name}"...`, '', { duration: 2000 });
  }

  viewReusable(item: Reusable): void {
    this.snackBar.open(`Opening "${item.name}"...`, '', { duration: 2000 });
  }
}

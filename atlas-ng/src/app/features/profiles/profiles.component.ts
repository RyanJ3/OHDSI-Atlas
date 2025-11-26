import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Import mock data
import profilesData from '../../core/mock-data/profiles.json';
import { ProfileDetailDialogComponent } from './profile-detail-dialog/profile-detail-dialog.component';

interface RecordCounts {
  conditions: number;
  drugs: number;
  procedures: number;
  measurements: number;
  observations: number;
  visits: number;
}

interface ObservationPeriod {
  start: string;
  end: string;
}

interface Profile {
  personId: number;
  gender: string;
  birthYear: number;
  deathYear: number | null;
  sourceName: string;
  cohorts: string[];
  recordCounts: RecordCounts;
  observationPeriod: ObservationPeriod;
}

@Component({
  selector: 'app-profiles',
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
    MatMenuModule,
    MatSelectModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  profiles = signal<Profile[]>([]);
  filteredProfiles = signal<Profile[]>([]);
  totalResults = signal(0);

  searchFilter = '';
  sourceFilter = 'all';
  genderFilter = 'all';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = [
    'personId',
    'demographics',
    'source',
    'cohorts',
    'records',
    'observationPeriod',
    'actions',
  ];

  sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'CDM Database', label: 'CDM Database' },
    { value: 'SYNPUF 5%', label: 'SYNPUF 5%' },
  ];

  genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.profiles.set(profilesData as Profile[]);
      this.applyFilters();
      this.loading.set(false);
    }, 300);
  }

  applyFilters(): void {
    let filtered = [...this.profiles()];

    // Apply source filter
    if (this.sourceFilter !== 'all') {
      filtered = filtered.filter((p) => p.sourceName === this.sourceFilter);
    }

    // Apply gender filter
    if (this.genderFilter !== 'all') {
      filtered = filtered.filter((p) => p.gender === this.genderFilter);
    }

    // Apply search filter
    const search = this.searchFilter.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.personId.toString().includes(search) ||
          p.cohorts.some((c) => c.toLowerCase().includes(search))
      );
    }

    this.filteredProfiles.set(filtered);
    this.totalResults.set(filtered.length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredProfiles()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredProfiles.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'personId':
            return this.compare(a.personId, b.personId, isAsc);
          case 'demographics':
            return this.compare(a.birthYear, b.birthYear, isAsc);
          case 'source':
            return this.compare(a.sourceName, b.sourceName, isAsc);
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedProfiles(): Profile[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProfiles().slice(start, end);
  }

  calculateAge(birthYear: number, deathYear: number | null): number {
    const endYear = deathYear || new Date().getFullYear();
    return endYear - birthYear;
  }

  getTotalRecords(profile: Profile): number {
    const counts = profile.recordCounts;
    return (
      counts.conditions +
      counts.drugs +
      counts.procedures +
      counts.measurements +
      counts.observations +
      counts.visits
    );
  }

  getObservationYears(profile: Profile): string {
    const start = new Date(profile.observationPeriod.start);
    const end = new Date(profile.observationPeriod.end);
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years.toFixed(1);
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  viewProfile(profile: Profile): void {
    this.dialog.open(ProfileDetailDialogComponent, {
      data: { profile },
      width: '850px',
      maxHeight: '90vh',
    });
  }

  viewTimeline(profile: Profile): void {
    this.snackBar.open(`Opening timeline for Person ${profile.personId}...`, '', {
      duration: 2000,
    });
  }

  exportProfile(profile: Profile): void {
    this.snackBar.open(`Exporting profile ${profile.personId}...`, '', {
      duration: 2000,
    });
  }

  getMaleCount(): number {
    return this.profiles().filter((p) => p.gender === 'Male').length;
  }

  getFemaleCount(): number {
    return this.profiles().filter((p) => p.gender === 'Female').length;
  }

  getDeceasedCount(): number {
    return this.profiles().filter((p) => p.deathYear !== null).length;
  }

  getAverageRecords(): number {
    if (this.profiles().length === 0) return 0;
    const total = this.profiles().reduce((sum, p) => sum + this.getTotalRecords(p), 0);
    return Math.round(total / this.profiles().length);
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../core/store';

// Import mock data for activity
import jobsData from '../../core/mock-data/jobs.json';

interface User {
  login: string;
  name?: string;
  email?: string;
  role?: string;
  createdDate?: string;
  lastLogin?: string;
}

interface ActivityItem {
  id: number;
  type: string;
  action: string;
  target: string;
  date: string;
  status: string;
  icon: string;
}

interface Permission {
  name: string;
  description: string;
  granted: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  user = signal<User | null>(null);
  loading = signal(false);
  recentActivity = signal<ActivityItem[]>([]);
  permissions = signal<Permission[]>([]);

  profileForm: FormGroup = this.fb.group({
    name: [''],
    email: ['', Validators.email],
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  });

  private originalFormValues: any;

  ngOnInit(): void {
    this.store.dispatch(setPageTitle({ title: 'Profile' }));
    this.loadUser();
    this.loadActivity();
    this.loadPermissions();
  }

  private loadUser(): void {
    const userJson = localStorage.getItem('atlas_user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        // Enhance with demo data
        this.user.set({
          ...userData,
          email: userData.email || `${userData.login}@ohdsi.org`,
          role: userData.role || 'Administrator',
          createdDate: userData.createdDate || '2024-01-15T10:00:00Z',
          lastLogin: userData.lastLogin || new Date().toISOString(),
        });

        // Populate form
        this.profileForm.patchValue({
          name: this.user()?.name || '',
          email: this.user()?.email || '',
        });
        this.originalFormValues = this.profileForm.value;
      } catch {
        this.user.set(null);
      }
    }
  }

  private loadActivity(): void {
    this.loading.set(true);

    setTimeout(() => {
      const jobTypeActions: Record<string, string> = {
        generateCohort: 'Generated cohort',
        runIRAnalysis: 'Ran incidence rate analysis',
        runCharacterization: 'Ran characterization',
        runPathwayAnalysis: 'Ran pathway analysis',
        runPLEAnalysis: 'Ran population-level estimation',
        runPLPAnalysis: 'Ran patient-level prediction',
        warmCache: 'Warmed cache',
      };

      const jobTypeIcons: Record<string, string> = {
        generateCohort: 'fa-users',
        runIRAnalysis: 'fa-bolt',
        runCharacterization: 'fa-chart-bar',
        runPathwayAnalysis: 'fa-route',
        runPLEAnalysis: 'fa-balance-scale',
        runPLPAnalysis: 'fa-brain',
        warmCache: 'fa-fire',
      };

      this.recentActivity.set(
        (jobsData as any[])
          .slice(0, 10)
          .map((job) => ({
            id: job.executionId,
            type: job.jobName,
            action: jobTypeActions[job.jobName] || 'Executed job',
            target: job.jobParameters.jobName || job.jobName,
            date: job.startTime,
            status: job.status,
            icon: jobTypeIcons[job.jobName] || 'fa-cog',
          }))
      );

      this.loading.set(false);
    }, 300);
  }

  private loadPermissions(): void {
    // Demo permissions based on typical ATLAS roles
    this.permissions.set([
      { name: 'View Data Sources', description: 'View configured data sources', granted: true },
      { name: 'Execute Cohort Generation', description: 'Generate cohorts on data sources', granted: true },
      { name: 'Create Cohort Definitions', description: 'Create and edit cohort definitions', granted: true },
      { name: 'Create Concept Sets', description: 'Create and edit concept sets', granted: true },
      { name: 'Run Characterizations', description: 'Execute characterization analyses', granted: true },
      { name: 'Run Pathway Analysis', description: 'Execute pathway analyses', granted: true },
      { name: 'Run Incidence Rates', description: 'Execute incidence rate analyses', granted: true },
      { name: 'Run Estimation', description: 'Execute population-level estimation', granted: true },
      { name: 'Run Prediction', description: 'Execute patient-level prediction', granted: true },
      { name: 'Manage Users', description: 'Create, edit, and delete users', granted: false },
      { name: 'Configure Data Sources', description: 'Add and configure data sources', granted: false },
      { name: 'System Administration', description: 'Access system configuration', granted: false },
    ]);
  }

  getUserInitials(): string {
    const u = this.user();
    if (!u) return '?';
    const name = u.name || u.login;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return 'Unknown';
    }
  }

  formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return 'Unknown';
    }
  }

  formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }

  getTotalJobs(): number {
    return (jobsData as any[]).length;
  }

  getCompletedJobs(): number {
    return (jobsData as any[]).filter((j) => j.status === 'COMPLETED').length;
  }

  getRunningJobs(): number {
    return (jobsData as any[]).filter((j) => j.status === 'RUNNING').length;
  }

  getFailedJobs(): number {
    return (jobsData as any[]).filter((j) => j.status === 'FAILED').length;
  }

  editProfile(): void {
    // Scroll to edit tab or switch to it
  }

  hasFormChanges(): boolean {
    return JSON.stringify(this.profileForm.value) !== JSON.stringify(this.originalFormValues);
  }

  resetForm(): void {
    this.profileForm.patchValue(this.originalFormValues);
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // In production, this would call an API
      const currentUser = this.user();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: this.profileForm.value.name,
          email: this.profileForm.value.email,
        };
        localStorage.setItem('atlas_user', JSON.stringify(updatedUser));
        this.user.set(updatedUser);
        this.originalFormValues = this.profileForm.value;
        this.snackBar.open('Profile updated successfully', 'OK', { duration: 3000 });
      }
    }
  }
}

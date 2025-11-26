import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface UserProfile {
  login: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

interface ActivityItem {
  id: number;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
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
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  editing = signal(false);
  selectedTab = 0;

  profile = signal<UserProfile>({
    login: '',
    name: '',
    email: '',
    role: '',
    organization: '',
    department: '',
    joinDate: '',
    lastLogin: '',
  });

  editableProfile: Partial<UserProfile> = {};

  recentActivity = signal<ActivityItem[]>([]);

  permissions = signal<Permission[]>([]);

  statistics = signal({
    cohortsCreated: 0,
    conceptSetsCreated: 0,
    analysesRun: 0,
    jobsExecuted: 0,
  });

  displayedColumns = ['action', 'target', 'timestamp'];

  ngOnInit(): void {
    this.loadProfile();
    this.loadActivity();
    this.loadPermissions();
    this.loadStatistics();
  }

  private loadProfile(): void {
    // Load user from localStorage (matching header component pattern)
    const userJson = localStorage.getItem('atlas_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.profile.set({
          login: user.login || 'demo_user',
          name: user.name || 'Demo User',
          email: user.email || `${user.login || 'demo'}@ohdsi.org`,
          role: user.role || 'Researcher',
          organization: user.organization || 'OHDSI Collaborative',
          department: user.department || 'Clinical Informatics',
          joinDate: user.joinDate || '2023-06-15',
          lastLogin: new Date().toISOString().split('T')[0],
        });
      } catch {
        this.setDefaultProfile();
      }
    } else {
      this.setDefaultProfile();
    }
    this.loading.set(false);
  }

  private setDefaultProfile(): void {
    this.profile.set({
      login: 'demo_user',
      name: 'Demo User',
      email: 'demo@ohdsi.org',
      role: 'Researcher',
      organization: 'OHDSI Collaborative',
      department: 'Clinical Informatics',
      joinDate: '2023-06-15',
      lastLogin: new Date().toISOString().split('T')[0],
    });
  }

  private loadActivity(): void {
    // Mock recent activity data
    this.recentActivity.set([
      {
        id: 1,
        action: 'Created',
        target: 'Type 2 Diabetes Cohort',
        targetType: 'Cohort Definition',
        timestamp: '2024-11-25 14:32',
        icon: 'fa-users',
      },
      {
        id: 2,
        action: 'Executed',
        target: 'Diabetes Characterization',
        targetType: 'Characterization',
        timestamp: '2024-11-25 11:15',
        icon: 'fa-bar-chart',
      },
      {
        id: 3,
        action: 'Modified',
        target: 'Cardiovascular Concept Set',
        targetType: 'Concept Set',
        timestamp: '2024-11-24 16:48',
        icon: 'fa-shopping-cart',
      },
      {
        id: 4,
        action: 'Viewed',
        target: 'Incidence Rate Analysis',
        targetType: 'Incidence Rate',
        timestamp: '2024-11-24 10:22',
        icon: 'fa-chart-line',
      },
      {
        id: 5,
        action: 'Exported',
        target: 'Patient Pathway Results',
        targetType: 'Pathway',
        timestamp: '2024-11-23 15:05',
        icon: 'fa-route',
      },
      {
        id: 6,
        action: 'Created',
        target: 'Hypertension Risk Prediction',
        targetType: 'Prediction',
        timestamp: '2024-11-22 09:33',
        icon: 'fa-brain',
      },
      {
        id: 7,
        action: 'Ran',
        target: 'Treatment Effect Estimation',
        targetType: 'Estimation',
        timestamp: '2024-11-21 13:18',
        icon: 'fa-chart-bar',
      },
    ]);
  }

  private loadPermissions(): void {
    // Load permissions from localStorage or use defaults
    const permissionsJson = localStorage.getItem('permissions');
    let userPermissions: string[] = [];
    if (permissionsJson) {
      try {
        const parsed = JSON.parse(permissionsJson);
        userPermissions = Array.isArray(parsed)
          ? parsed.map((p: any) => p.permission || p)
          : [];
      } catch {
        userPermissions = [];
      }
    }

    // Define available permissions with descriptions
    const allPermissions: Permission[] = [
      { name: 'cohort:read', description: 'View cohort definitions', granted: true },
      { name: 'cohort:write', description: 'Create and modify cohort definitions', granted: true },
      { name: 'cohort:delete', description: 'Delete cohort definitions', granted: true },
      { name: 'conceptset:read', description: 'View concept sets', granted: true },
      { name: 'conceptset:write', description: 'Create and modify concept sets', granted: true },
      { name: 'analysis:execute', description: 'Execute analyses and jobs', granted: true },
      { name: 'source:read', description: 'Access data sources', granted: true },
      { name: 'source:manage', description: 'Manage data source connections', granted: false },
      { name: 'admin:users', description: 'Manage user accounts', granted: false },
      { name: 'admin:config', description: 'Modify system configuration', granted: false },
    ];

    // If we have actual permissions, check against them
    if (userPermissions.length > 0) {
      allPermissions.forEach(p => {
        p.granted = userPermissions.some(up =>
          up === p.name || up.includes(p.name.split(':')[0])
        );
      });
    }

    this.permissions.set(allPermissions);
  }

  private loadStatistics(): void {
    // Mock statistics - in real app would come from API
    this.statistics.set({
      cohortsCreated: 12,
      conceptSetsCreated: 8,
      analysesRun: 45,
      jobsExecuted: 156,
    });
  }

  getUserInitials(): string {
    const name = this.profile().name;
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  startEditing(): void {
    this.editableProfile = { ...this.profile() };
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
    this.editableProfile = {};
  }

  saveProfile(): void {
    // Update profile with editable values
    const currentProfile = this.profile();
    const updatedProfile = {
      ...currentProfile,
      name: this.editableProfile.name || currentProfile.name,
      email: this.editableProfile.email || currentProfile.email,
      organization: this.editableProfile.organization || currentProfile.organization,
      department: this.editableProfile.department || currentProfile.department,
    };

    this.profile.set(updatedProfile);

    // Save to localStorage
    const userJson = localStorage.getItem('atlas_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        user.name = updatedProfile.name;
        user.email = updatedProfile.email;
        user.organization = updatedProfile.organization;
        user.department = updatedProfile.department;
        localStorage.setItem('atlas_user', JSON.stringify(user));
      } catch {
        // Ignore errors
      }
    }

    this.editing.set(false);
    this.snackBar.open('Profile updated successfully', 'OK', { duration: 3000 });
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Change Password',
        message: 'Password change requires re-authentication. You will be redirected to the login page after changing your password.',
        confirmText: 'Continue',
        cancelText: 'Cancel',
        type: 'info',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.snackBar.open('Password change feature coming soon', 'OK', { duration: 3000 });
      }
    });
  }

  exportActivityLog(): void {
    const activity = this.recentActivity();
    const csvContent = [
      'Action,Target,Type,Timestamp',
      ...activity.map(a => `${a.action},"${a.target}",${a.targetType},${a.timestamp}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Activity log exported', 'OK', { duration: 3000 });
  }
}

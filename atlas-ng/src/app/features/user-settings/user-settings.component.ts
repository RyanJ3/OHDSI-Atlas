import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface SettingSection {
  name: string;
  icon: string;
  description: string;
  settings: Setting[];
}

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number' | 'text';
  value: boolean | string | number;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  hasChanges = signal(false);

  settingSections: SettingSection[] = [
    {
      name: 'Appearance',
      icon: 'fas fa-palette',
      description: 'Customize the look and feel of ATLAS',
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color theme',
          type: 'select',
          value: 'light',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'System Default' },
          ],
        },
        {
          key: 'sidenavCollapsed',
          label: 'Collapse Sidebar by Default',
          description: 'Start with sidebar collapsed on page load',
          type: 'toggle',
          value: false,
        },
        {
          key: 'compactMode',
          label: 'Compact Mode',
          description: 'Reduce spacing for denser information display',
          type: 'toggle',
          value: false,
        },
        {
          key: 'showWelcomeMessage',
          label: 'Show Welcome Message',
          description: 'Display welcome message on the home page',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      name: 'Notifications',
      icon: 'fas fa-bell',
      description: 'Configure how you receive notifications',
      settings: [
        {
          key: 'enableNotifications',
          label: 'Enable Notifications',
          description: 'Show notifications for job completions and system events',
          type: 'toggle',
          value: true,
        },
        {
          key: 'notificationSound',
          label: 'Notification Sound',
          description: 'Play a sound when notifications arrive',
          type: 'toggle',
          value: false,
        },
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive email notifications for important events',
          type: 'toggle',
          value: false,
        },
        {
          key: 'jobCompletionAlert',
          label: 'Job Completion Alerts',
          description: 'Get notified when analysis jobs complete',
          type: 'toggle',
          value: true,
        },
        {
          key: 'errorAlerts',
          label: 'Error Alerts',
          description: 'Get notified when jobs fail or encounter errors',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      name: 'Tables & Lists',
      icon: 'fas fa-table',
      description: 'Configure table and list display preferences',
      settings: [
        {
          key: 'defaultPageSize',
          label: 'Default Page Size',
          description: 'Number of rows to display per page in tables',
          type: 'select',
          value: '25',
          options: [
            { value: '10', label: '10 rows' },
            { value: '25', label: '25 rows' },
            { value: '50', label: '50 rows' },
            { value: '100', label: '100 rows' },
          ],
        },
        {
          key: 'showRowNumbers',
          label: 'Show Row Numbers',
          description: 'Display row numbers in tables',
          type: 'toggle',
          value: false,
        },
        {
          key: 'stickyHeaders',
          label: 'Sticky Table Headers',
          description: 'Keep table headers visible when scrolling',
          type: 'toggle',
          value: true,
        },
        {
          key: 'alternatingRows',
          label: 'Alternating Row Colors',
          description: 'Alternate background colors for easier reading',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      name: 'Analysis Defaults',
      icon: 'fas fa-flask',
      description: 'Set default options for new analyses',
      settings: [
        {
          key: 'autoSave',
          label: 'Auto-Save',
          description: 'Automatically save changes while editing',
          type: 'toggle',
          value: false,
        },
        {
          key: 'autoSaveInterval',
          label: 'Auto-Save Interval (seconds)',
          description: 'How often to auto-save when enabled',
          type: 'number',
          value: 30,
        },
        {
          key: 'confirmBeforeExecute',
          label: 'Confirm Before Execute',
          description: 'Show confirmation dialog before running analyses',
          type: 'toggle',
          value: true,
        },
        {
          key: 'defaultResultsView',
          label: 'Default Results View',
          description: 'How to display analysis results',
          type: 'select',
          value: 'table',
          options: [
            { value: 'table', label: 'Table View' },
            { value: 'chart', label: 'Chart View' },
            { value: 'split', label: 'Split View' },
          ],
        },
      ],
    },
    {
      name: 'Privacy & Data',
      icon: 'fas fa-shield-alt',
      description: 'Manage your data and privacy preferences',
      settings: [
        {
          key: 'rememberFilters',
          label: 'Remember Filters',
          description: 'Remember filter selections between sessions',
          type: 'toggle',
          value: true,
        },
        {
          key: 'trackUsage',
          label: 'Usage Analytics',
          description: 'Help improve ATLAS by sharing anonymous usage data',
          type: 'toggle',
          value: false,
        },
        {
          key: 'clearOnLogout',
          label: 'Clear Data on Logout',
          description: 'Remove cached data when signing out',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      name: 'Accessibility',
      icon: 'fas fa-universal-access',
      description: 'Accessibility and keyboard navigation settings',
      settings: [
        {
          key: 'highContrast',
          label: 'High Contrast Mode',
          description: 'Increase contrast for better visibility',
          type: 'toggle',
          value: false,
        },
        {
          key: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimize animations and transitions',
          type: 'toggle',
          value: false,
        },
        {
          key: 'fontSize',
          label: 'Font Size',
          description: 'Adjust the base font size',
          type: 'select',
          value: 'medium',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'x-large', label: 'Extra Large' },
          ],
        },
        {
          key: 'keyboardShortcuts',
          label: 'Keyboard Shortcuts',
          description: 'Enable keyboard shortcuts for common actions',
          type: 'toggle',
          value: true,
        },
      ],
    },
  ];

  private originalSettings: string = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('atlas-user-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.applySettings(settings);
      } catch {
        // Use defaults
      }
    }
    this.originalSettings = this.serializeSettings();
    this.loading.set(false);
  }

  private applySettings(settings: Record<string, any>): void {
    this.settingSections.forEach(section => {
      section.settings.forEach(setting => {
        if (settings.hasOwnProperty(setting.key)) {
          setting.value = settings[setting.key];
        }
      });
    });
  }

  private serializeSettings(): string {
    const settings: Record<string, any> = {};
    this.settingSections.forEach(section => {
      section.settings.forEach(setting => {
        settings[setting.key] = setting.value;
      });
    });
    return JSON.stringify(settings);
  }

  onSettingChange(): void {
    this.hasChanges.set(this.serializeSettings() !== this.originalSettings);
  }

  saveSettings(): void {
    const settings: Record<string, any> = {};
    this.settingSections.forEach(section => {
      section.settings.forEach(setting => {
        settings[setting.key] = setting.value;
      });
    });

    localStorage.setItem('atlas-user-settings', JSON.stringify(settings));
    this.originalSettings = this.serializeSettings();
    this.hasChanges.set(false);

    this.snackBar.open('Settings saved successfully', 'OK', { duration: 3000 });
  }

  resetSettings(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Settings',
        message: 'Are you sure you want to reset all settings to their default values? This cannot be undone.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        type: 'warning',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Reset to defaults
        this.settingSections = this.getDefaultSettings();
        localStorage.removeItem('atlas-user-settings');
        this.originalSettings = this.serializeSettings();
        this.hasChanges.set(false);
        this.snackBar.open('Settings reset to defaults', 'OK', { duration: 3000 });
      }
    });
  }

  private getDefaultSettings(): SettingSection[] {
    return [
      {
        name: 'Appearance',
        icon: 'fas fa-palette',
        description: 'Customize the look and feel of ATLAS',
        settings: [
          { key: 'theme', label: 'Theme', description: 'Choose your preferred color theme', type: 'select', value: 'light', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'auto', label: 'System Default' }] },
          { key: 'sidenavCollapsed', label: 'Collapse Sidebar by Default', description: 'Start with sidebar collapsed on page load', type: 'toggle', value: false },
          { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing for denser information display', type: 'toggle', value: false },
          { key: 'showWelcomeMessage', label: 'Show Welcome Message', description: 'Display welcome message on the home page', type: 'toggle', value: true },
        ],
      },
      {
        name: 'Notifications',
        icon: 'fas fa-bell',
        description: 'Configure how you receive notifications',
        settings: [
          { key: 'enableNotifications', label: 'Enable Notifications', description: 'Show notifications for job completions and system events', type: 'toggle', value: true },
          { key: 'notificationSound', label: 'Notification Sound', description: 'Play a sound when notifications arrive', type: 'toggle', value: false },
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email notifications for important events', type: 'toggle', value: false },
          { key: 'jobCompletionAlert', label: 'Job Completion Alerts', description: 'Get notified when analysis jobs complete', type: 'toggle', value: true },
          { key: 'errorAlerts', label: 'Error Alerts', description: 'Get notified when jobs fail or encounter errors', type: 'toggle', value: true },
        ],
      },
      {
        name: 'Tables & Lists',
        icon: 'fas fa-table',
        description: 'Configure table and list display preferences',
        settings: [
          { key: 'defaultPageSize', label: 'Default Page Size', description: 'Number of rows to display per page in tables', type: 'select', value: '25', options: [{ value: '10', label: '10 rows' }, { value: '25', label: '25 rows' }, { value: '50', label: '50 rows' }, { value: '100', label: '100 rows' }] },
          { key: 'showRowNumbers', label: 'Show Row Numbers', description: 'Display row numbers in tables', type: 'toggle', value: false },
          { key: 'stickyHeaders', label: 'Sticky Table Headers', description: 'Keep table headers visible when scrolling', type: 'toggle', value: true },
          { key: 'alternatingRows', label: 'Alternating Row Colors', description: 'Alternate background colors for easier reading', type: 'toggle', value: true },
        ],
      },
      {
        name: 'Analysis Defaults',
        icon: 'fas fa-flask',
        description: 'Set default options for new analyses',
        settings: [
          { key: 'autoSave', label: 'Auto-Save', description: 'Automatically save changes while editing', type: 'toggle', value: false },
          { key: 'autoSaveInterval', label: 'Auto-Save Interval (seconds)', description: 'How often to auto-save when enabled', type: 'number', value: 30 },
          { key: 'confirmBeforeExecute', label: 'Confirm Before Execute', description: 'Show confirmation dialog before running analyses', type: 'toggle', value: true },
          { key: 'defaultResultsView', label: 'Default Results View', description: 'How to display analysis results', type: 'select', value: 'table', options: [{ value: 'table', label: 'Table View' }, { value: 'chart', label: 'Chart View' }, { value: 'split', label: 'Split View' }] },
        ],
      },
      {
        name: 'Privacy & Data',
        icon: 'fas fa-shield-alt',
        description: 'Manage your data and privacy preferences',
        settings: [
          { key: 'rememberFilters', label: 'Remember Filters', description: 'Remember filter selections between sessions', type: 'toggle', value: true },
          { key: 'trackUsage', label: 'Usage Analytics', description: 'Help improve ATLAS by sharing anonymous usage data', type: 'toggle', value: false },
          { key: 'clearOnLogout', label: 'Clear Data on Logout', description: 'Remove cached data when signing out', type: 'toggle', value: false },
        ],
      },
      {
        name: 'Accessibility',
        icon: 'fas fa-universal-access',
        description: 'Accessibility and keyboard navigation settings',
        settings: [
          { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility', type: 'toggle', value: false },
          { key: 'reducedMotion', label: 'Reduce Motion', description: 'Minimize animations and transitions', type: 'toggle', value: false },
          { key: 'fontSize', label: 'Font Size', description: 'Adjust the base font size', type: 'select', value: 'medium', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'x-large', label: 'Extra Large' }] },
          { key: 'keyboardShortcuts', label: 'Keyboard Shortcuts', description: 'Enable keyboard shortcuts for common actions', type: 'toggle', value: true },
        ],
      },
    ];
  }

  exportSettings(): void {
    const settings: Record<string, any> = {};
    this.settingSections.forEach(section => {
      section.settings.forEach(setting => {
        settings[setting.key] = setting.value;
      });
    });

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas-user-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Settings exported', 'OK', { duration: 3000 });
  }

  importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const settings = JSON.parse(e.target.result);
            this.applySettings(settings);
            this.hasChanges.set(true);
            this.snackBar.open('Settings imported. Click Save to apply.', 'OK', { duration: 4000 });
          } catch {
            this.snackBar.open('Invalid settings file', 'OK', { duration: 3000 });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

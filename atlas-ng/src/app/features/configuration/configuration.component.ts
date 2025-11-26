import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface ConfigSection {
  name: string;
  icon: string;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
})
export class ConfigurationComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  testing = signal(false);
  selectedTab = 0;

  configSections: ConfigSection[] = [
    {
      name: 'General',
      icon: 'fas fa-cog',
      settings: [
        {
          key: 'defaultLocale',
          label: 'Default Locale',
          description: 'The default language for the application',
          type: 'select',
          value: 'en',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ],
        },
        {
          key: 'defaultPaginationSize',
          label: 'Default Page Size',
          description: 'Number of items to show per page in tables',
          type: 'number',
          value: 25,
        },
        {
          key: 'enableTutorial',
          label: 'Show Tutorial',
          description: 'Display tutorial hints for new users',
          type: 'boolean',
          value: true,
        },
      ],
    },
    {
      name: 'Data Sources',
      icon: 'fas fa-database',
      settings: [
        {
          key: 'webApiUrl',
          label: 'WebAPI URL',
          description: 'Base URL for the OHDSI WebAPI service',
          type: 'text',
          value: 'http://localhost:8080/WebAPI/',
        },
        {
          key: 'defaultSourceKey',
          label: 'Default Source',
          description: 'Default data source for new analyses',
          type: 'select',
          value: 'cdm',
          options: [
            { value: 'cdm', label: 'CDM Database' },
            { value: 'synpuf', label: 'SYNPUF 5%' },
          ],
        },
        {
          key: 'cacheEnabled',
          label: 'Enable Caching',
          description: 'Cache data source results for better performance',
          type: 'boolean',
          value: true,
        },
      ],
    },
    {
      name: 'Security',
      icon: 'fas fa-shield-alt',
      settings: [
        {
          key: 'authenticationMethod',
          label: 'Authentication Method',
          description: 'How users authenticate to ATLAS',
          type: 'select',
          value: 'db',
          options: [
            { value: 'db', label: 'Database Authentication' },
            { value: 'ldap', label: 'LDAP/Active Directory' },
            { value: 'oauth', label: 'OAuth 2.0' },
            { value: 'saml', label: 'SAML 2.0' },
          ],
        },
        {
          key: 'sessionTimeout',
          label: 'Session Timeout (minutes)',
          description: 'Time before idle sessions expire',
          type: 'number',
          value: 30,
        },
        {
          key: 'enforceSecureConnection',
          label: 'Require HTTPS',
          description: 'Enforce secure connections only',
          type: 'boolean',
          value: false,
        },
      ],
    },
    {
      name: 'Execution',
      icon: 'fas fa-play-circle',
      settings: [
        {
          key: 'maxConcurrentJobs',
          label: 'Max Concurrent Jobs',
          description: 'Maximum number of jobs that can run simultaneously',
          type: 'number',
          value: 5,
        },
        {
          key: 'jobQueueTimeout',
          label: 'Queue Timeout (hours)',
          description: 'Maximum time a job can wait in queue',
          type: 'number',
          value: 24,
        },
        {
          key: 'enableJobNotifications',
          label: 'Job Notifications',
          description: 'Send email notifications on job completion',
          type: 'boolean',
          value: true,
        },
      ],
    },
    {
      name: 'Evidence',
      icon: 'fas fa-book-medical',
      settings: [
        {
          key: 'evidenceServiceUrl',
          label: 'Evidence Service URL',
          description: 'URL for the evidence service API',
          type: 'text',
          value: 'http://localhost:8081/evidence/',
        },
        {
          key: 'pubMedApiKey',
          label: 'PubMed API Key',
          description: 'API key for PubMed literature search',
          type: 'text',
          value: '',
        },
      ],
    },
  ];

  systemInfo = {
    atlasVersion: '3.0.0',
    webApiVersion: '2.14.0',
    cdmVersion: '5.4',
    vocabularyVersion: '5.0 20230601',
    databasePlatform: 'PostgreSQL',
    javaVersion: '11.0.20',
    buildDate: '2024-11-01',
  };

  ngOnInit(): void {
    // Simulate loading
    setTimeout(() => {
      this.loading.set(false);
    }, 300);
  }

  saveSettings(): void {
    // In a real app, this would call an API
    console.log('Saving settings...', this.configSections);

    // Simulate saving with localStorage
    const settingsToSave: Record<string, any> = {};
    this.configSections.forEach(section => {
      section.settings.forEach(setting => {
        settingsToSave[setting.key] = setting.value;
      });
    });
    localStorage.setItem('atlas-settings', JSON.stringify(settingsToSave));

    this.snackBar.open('Settings saved successfully', 'OK', { duration: 3000 });
  }

  resetSettings(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Settings',
        message: 'Are you sure you want to reset all settings to defaults? This cannot be undone.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        type: 'warning',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Reset to default values
        this.configSections.forEach(section => {
          section.settings.forEach(setting => {
            if (setting.key === 'defaultLocale') setting.value = 'en';
            else if (setting.key === 'defaultPaginationSize') setting.value = 25;
            else if (setting.key === 'enableTutorial') setting.value = true;
            else if (setting.key === 'webApiUrl') setting.value = 'http://localhost:8080/WebAPI/';
            else if (setting.key === 'defaultSourceKey') setting.value = 'cdm';
            else if (setting.key === 'cacheEnabled') setting.value = true;
            else if (setting.key === 'authenticationMethod') setting.value = 'db';
            else if (setting.key === 'sessionTimeout') setting.value = 30;
            else if (setting.key === 'enforceSecureConnection') setting.value = false;
            else if (setting.key === 'maxConcurrentJobs') setting.value = 5;
            else if (setting.key === 'jobQueueTimeout') setting.value = 24;
            else if (setting.key === 'enableJobNotifications') setting.value = true;
            else if (setting.key === 'evidenceServiceUrl') setting.value = 'http://localhost:8081/evidence/';
            else if (setting.key === 'pubMedApiKey') setting.value = '';
          });
        });

        localStorage.removeItem('atlas-settings');
        this.snackBar.open('Settings reset to defaults', 'OK', { duration: 3000 });
      }
    });
  }

  clearCache(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear Cache',
        message: 'Are you sure you want to clear the application cache? This may temporarily slow down performance.',
        confirmText: 'Clear Cache',
        cancelText: 'Cancel',
        type: 'warning',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Clear localStorage cache entries
        const keysToRemove = Object.keys(localStorage).filter(
          key => key.startsWith('atlas-cache-')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.snackBar.open('Cache cleared successfully', 'OK', { duration: 3000 });
      }
    });
  }

  testConnection(): void {
    this.testing.set(true);
    this.snackBar.open('Testing connection to WebAPI...', '', { duration: 2000 });

    // Simulate connection test
    setTimeout(() => {
      this.testing.set(false);
      // Simulate successful connection
      this.snackBar.open('Connection successful! WebAPI is responding.', 'OK', { duration: 4000 });
    }, 2000);
  }

  exportSettings(): void {
    const settingsToExport: Record<string, any> = {};
    this.configSections.forEach(section => {
      section.settings.forEach(setting => {
        settingsToExport[setting.key] = setting.value;
      });
    });

    const blob = new Blob([JSON.stringify(settingsToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Settings exported', 'OK', { duration: 3000 });
  }
}

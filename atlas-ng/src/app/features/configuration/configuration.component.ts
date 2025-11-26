import { Component, OnInit, signal } from '@angular/core';
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
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
})
export class ConfigurationComponent implements OnInit {
  loading = signal(true);
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
    alert('Settings saved successfully!');
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset logic would go here
      alert('Settings reset to defaults');
    }
  }

  clearCache(): void {
    if (confirm('Are you sure you want to clear the application cache?')) {
      alert('Cache cleared successfully');
    }
  }

  testConnection(): void {
    alert('Testing connection to WebAPI...\n\nConnection successful!');
  }
}

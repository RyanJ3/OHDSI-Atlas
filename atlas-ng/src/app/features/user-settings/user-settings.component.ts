import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../core/store';

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-user-settings',
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
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    MatRadioModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  activeSection = signal('appearance');

  settingsSections: SettingsSection[] = [
    { key: 'appearance', title: 'Appearance', description: 'Theme and display', icon: 'fa-palette' },
    { key: 'notifications', title: 'Notifications', description: 'Alerts and updates', icon: 'fa-bell' },
    { key: 'analysis', title: 'Analysis Defaults', description: 'Default settings', icon: 'fa-chart-bar' },
    { key: 'keyboard', title: 'Keyboard Shortcuts', description: 'Learn shortcuts', icon: 'fa-keyboard' },
    { key: 'language', title: 'Language & Region', description: 'Locale settings', icon: 'fa-globe' },
    { key: 'privacy', title: 'Privacy & Security', description: 'Security options', icon: 'fa-shield-alt' },
  ];

  appearanceForm: FormGroup = this.fb.group({
    theme: ['light'],
    sidebarCollapsed: [false],
    compactMode: [false],
    rowsPerPage: [25],
  });

  notificationsForm: FormGroup = this.fb.group({
    enabled: [true],
    jobCompletion: [true],
    jobFailure: [true],
    emailEnabled: [false],
    soundEnabled: [false],
  });

  analysisForm: FormGroup = this.fb.group({
    defaultDataSource: ['SYNPUF'],
    autoRunOnSave: [false],
    minCellCount: [5],
    includeDescendants: [true],
    resultsRetention: [30],
  });

  languageForm: FormGroup = this.fb.group({
    language: ['en'],
    dateFormat: ['MM/DD/YYYY'],
    timeFormat: ['12h'],
    numberFormat: ['1,234.56'],
  });

  privacyForm: FormGroup = this.fb.group({
    rememberSession: [true],
    sessionTimeout: [60],
    activityLogging: [true],
  });

  ngOnInit(): void {
    this.store.dispatch(setPageTitle({ title: 'Settings' }));
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('atlas_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.appearance) this.appearanceForm.patchValue(settings.appearance);
        if (settings.notifications) this.notificationsForm.patchValue(settings.notifications);
        if (settings.analysis) this.analysisForm.patchValue(settings.analysis);
        if (settings.language) this.languageForm.patchValue(settings.language);
        if (settings.privacy) this.privacyForm.patchValue(settings.privacy);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  saveSettings(): void {
    const settings = {
      appearance: this.appearanceForm.value,
      notifications: this.notificationsForm.value,
      analysis: this.analysisForm.value,
      language: this.languageForm.value,
      privacy: this.privacyForm.value,
    };

    localStorage.setItem('atlas_settings', JSON.stringify(settings));
    this.snackBar.open('Settings saved successfully', 'OK', { duration: 3000 });
  }

  resetSettings(): void {
    this.appearanceForm.reset({
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false,
      rowsPerPage: 25,
    });

    this.notificationsForm.reset({
      enabled: true,
      jobCompletion: true,
      jobFailure: true,
      emailEnabled: false,
      soundEnabled: false,
    });

    this.analysisForm.reset({
      defaultDataSource: 'SYNPUF',
      autoRunOnSave: false,
      minCellCount: 5,
      includeDescendants: true,
      resultsRetention: 30,
    });

    this.languageForm.reset({
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: '1,234.56',
    });

    this.privacyForm.reset({
      rememberSession: true,
      sessionTimeout: 60,
      activityLogging: true,
    });

    this.snackBar.open('Settings reset to defaults', 'OK', { duration: 3000 });
  }

  clearLocalData(): void {
    localStorage.removeItem('atlas_settings');
    this.snackBar.open('Local data cleared', 'OK', { duration: 3000 });
    this.resetSettings();
  }
}

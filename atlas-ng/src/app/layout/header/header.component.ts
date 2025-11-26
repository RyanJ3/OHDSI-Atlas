import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import { toggleSidenav } from '../../core/store';

// Import mock data for global search
import cohortDefinitionsData from '../../core/mock-data/cohort-definitions.json';
import conceptSetsData from '../../core/mock-data/concept-sets.json';
import characterizationsData from '../../core/mock-data/characterizations.json';
import incidenceRatesData from '../../core/mock-data/incidence-rates.json';
import pathwaysData from '../../core/mock-data/pathways.json';
import predictionsData from '../../core/mock-data/predictions.json';
import estimationsData from '../../core/mock-data/estimations.json';
import jobsData from '../../core/mock-data/jobs.json';

interface User {
  login: string;
  name?: string;
}

interface SearchResult {
  id: number;
  name: string;
  type: 'cohort' | 'conceptset' | 'characterization' | 'incidencerate' | 'pathway' | 'prediction' | 'estimation';
  typeLabel: string;
  icon: string;
  route: string;
}

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  user = signal<User | null>(null);
  searchQuery = signal('');
  searchResults = signal<SearchResult[]>([]);
  showSearch = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  // All searchable items
  private allItems: SearchResult[] = [];

  ngOnInit(): void {
    this.loadUser();
    this.buildSearchIndex();
    this.loadNotifications();
  }

  private loadNotifications(): void {
    // Generate notifications from recent jobs
    const recentJobs = (jobsData as any[])
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);

    const notifications: Notification[] = recentJobs.map((job, index) => {
      const statusMap: Record<string, { type: Notification['type']; icon: string }> = {
        COMPLETED: { type: 'success', icon: 'fa-check-circle' },
        FAILED: { type: 'error', icon: 'fa-times-circle' },
        RUNNING: { type: 'info', icon: 'fa-spinner' },
        STOPPED: { type: 'warning', icon: 'fa-stop-circle' },
      };

      const statusInfo = statusMap[job.status] || { type: 'info', icon: 'fa-info-circle' };
      const jobDate = new Date(job.startTime);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60));
      const timeAgo = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${diffHours}h ago` : `${Math.floor(diffHours / 24)}d ago`;

      return {
        id: job.executionId,
        type: statusInfo.type,
        title: `Job ${job.status.toLowerCase()}`,
        message: job.jobName,
        time: timeAgo,
        read: index > 1, // First 2 notifications unread
        icon: statusInfo.icon,
      };
    });

    this.notifications.set(notifications);
  }

  markNotificationRead(notification: Notification): void {
    this.notifications.update(list =>
      list.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  }

  markAllNotificationsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }

  private buildSearchIndex(): void {
    this.allItems = [
      ...this.mapItems(cohortDefinitionsData, 'cohort', 'Cohort Definition', 'fa-users', '/cohort-definitions'),
      ...this.mapItems(conceptSetsData, 'conceptset', 'Concept Set', 'fa-shopping-cart', '/concept-sets'),
      ...this.mapItems(characterizationsData, 'characterization', 'Characterization', 'fa-bar-chart', '/characterizations'),
      ...this.mapItems(incidenceRatesData, 'incidencerate', 'Incidence Rate', 'fa-chart-line', '/incidence-rates'),
      ...this.mapItems(pathwaysData, 'pathway', 'Pathway', 'fa-route', '/pathways'),
      ...this.mapItems(predictionsData, 'prediction', 'Prediction', 'fa-brain', '/prediction'),
      ...this.mapItems(estimationsData, 'estimation', 'Estimation', 'fa-chart-bar', '/estimation'),
    ];
  }

  private mapItems(
    data: any[],
    type: SearchResult['type'],
    typeLabel: string,
    icon: string,
    baseRoute: string
  ): SearchResult[] {
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type,
      typeLabel,
      icon,
      route: baseRoute,
    }));
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    if (query.trim().length < 2) {
      this.searchResults.set([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = this.allItems
      .filter(item => item.name.toLowerCase().includes(lowerQuery))
      .slice(0, 10);
    this.searchResults.set(results);
  }

  selectResult(result: SearchResult): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showSearch.set(false);
    this.router.navigate([result.route], { queryParams: { search: result.name } });
  }

  toggleSearch(): void {
    this.showSearch.update(v => !v);
    if (!this.showSearch()) {
      this.searchQuery.set('');
      this.searchResults.set([]);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  private loadUser(): void {
    const userJson = localStorage.getItem('atlas_user');
    if (userJson) {
      try {
        this.user.set(JSON.parse(userJson));
      } catch {
        this.user.set(null);
      }
    }
  }

  toggleSidenav(): void {
    this.store.dispatch(toggleSidenav());
  }

  logout(): void {
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('atlas_user');
    this.user.set(null);
    this.router.navigate(['/login']);
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

  getDisplayName(): string {
    const u = this.user();
    if (!u) return 'User';
    return u.name || u.login;
  }
}

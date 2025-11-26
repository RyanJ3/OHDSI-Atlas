import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../core/store';

// Import mock data
import sourcesData from '../../core/mock-data/sources.json';
import jobsData from '../../core/mock-data/jobs.json';
import cohortDefinitionsData from '../../core/mock-data/cohort-definitions.json';
import conceptSetsData from '../../core/mock-data/concept-sets.json';
import characterizationsData from '../../core/mock-data/characterizations.json';
import incidenceRatesData from '../../core/mock-data/incidence-rates.json';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

interface StatCard {
  label: string;
  value: number;
  icon: string;
  route: string;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  name: string;
  author: string;
  status: string;
  date: string;
  icon: string;
  route: string;
}

interface DataSource {
  sourceId: number;
  sourceName: string;
  sourceDialect: string;
  sourceKey: string;
  daimons: { daimonType: string; tableQualifier: string; priority: number }[];
  status: 'connected' | 'disconnected' | 'warning';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private store = inject(Store);

  loading = signal(true);
  stats = signal<StatCard[]>([]);
  recentActivity = signal<RecentActivity[]>([]);
  dataSources = signal<DataSource[]>([]);

  quickActions: QuickAction[] = [
    {
      title: 'Search Vocabulary',
      description: 'Search and explore the OMOP standardized vocabulary',
      icon: 'fa-search',
      route: '/search',
      color: '#1976d2',
    },
    {
      title: 'Cohort Definitions',
      description: 'Create and manage cohort definitions for your studies',
      icon: 'fa-users',
      route: '/cohortdefinitions',
      color: '#388e3c',
    },
    {
      title: 'Concept Sets',
      description: 'Build reusable concept sets for analysis',
      icon: 'fa-shopping-cart',
      route: '/conceptsets',
      color: '#7b1fa2',
    },
    {
      title: 'Characterizations',
      description: 'Characterize cohorts and compare populations',
      icon: 'fa-chart-line',
      route: '/characterizations',
      color: '#c2185b',
    },
    {
      title: 'Incidence Rates',
      description: 'Calculate incidence rates for outcomes in cohorts',
      icon: 'fa-bolt',
      route: '/incidence-rates',
      color: '#f57c00',
    },
    {
      title: 'Patient Profiles',
      description: 'Explore individual patient timelines and data',
      icon: 'fa-user',
      route: '/profiles',
      color: '#0097a7',
    },
  ];

  ngOnInit(): void {
    this.store.dispatch(setPageTitle({ title: 'Home' }));
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    setTimeout(() => {
      // Load statistics
      this.stats.set([
        {
          label: 'Cohort Definitions',
          value: cohortDefinitionsData.length,
          icon: 'fa-users',
          route: '/cohortdefinitions',
          color: '#388e3c',
        },
        {
          label: 'Concept Sets',
          value: conceptSetsData.length,
          icon: 'fa-shopping-cart',
          route: '/conceptsets',
          color: '#7b1fa2',
        },
        {
          label: 'Characterizations',
          value: characterizationsData.length,
          icon: 'fa-chart-bar',
          route: '/characterizations',
          color: '#c2185b',
        },
        {
          label: 'IR Analyses',
          value: incidenceRatesData.length,
          icon: 'fa-bolt',
          route: '/incidence-rates',
          color: '#f57c00',
        },
      ]);

      // Load recent activity from jobs
      const jobTypeIcons: Record<string, string> = {
        generateCohort: 'fa-users',
        runIRAnalysis: 'fa-bolt',
        runCharacterization: 'fa-chart-bar',
        runPathwayAnalysis: 'fa-route',
        runPLEAnalysis: 'fa-balance-scale',
        runPLPAnalysis: 'fa-brain',
        warmCache: 'fa-fire',
      };

      const jobTypeRoutes: Record<string, string> = {
        generateCohort: '/cohortdefinitions',
        runIRAnalysis: '/incidence-rates',
        runCharacterization: '/characterizations',
        runPathwayAnalysis: '/pathways',
        runPLEAnalysis: '/estimation',
        runPLPAnalysis: '/prediction',
        warmCache: '/jobs',
      };

      this.recentActivity.set(
        (jobsData as any[])
          .slice(0, 5)
          .map((job) => ({
            id: job.executionId,
            type: job.jobName,
            name: job.jobParameters.jobName || job.jobName,
            author: job.jobParameters.jobAuthor || 'system',
            status: job.status,
            date: job.startDate,
            icon: jobTypeIcons[job.jobName] || 'fa-cog',
            route: jobTypeRoutes[job.jobName] || '/jobs',
          }))
      );

      // Load data sources with simulated status
      this.dataSources.set(
        (sourcesData as any[]).map((source, index) => ({
          ...source,
          status: index === 0 ? 'connected' : index === 1 ? 'connected' : 'warning',
        }))
      );

      this.loading.set(false);
    }, 300);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'RUNNING':
        return 'status-running';
      case 'FAILED':
        return 'status-failed';
      case 'STOPPED':
        return 'status-stopped';
      default:
        return 'status-pending';
    }
  }

  getSourceStatusClass(status: string): string {
    switch (status) {
      case 'connected':
        return 'source-connected';
      case 'warning':
        return 'source-warning';
      default:
        return 'source-disconnected';
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

  getDaimonLabel(daimon: { daimonType: string }): string {
    return daimon.daimonType;
  }

  getRunningJobsCount(): number {
    return (jobsData as any[]).filter((j) => j.status === 'RUNNING').length;
  }

  getCompletedJobsToday(): number {
    const today = new Date().toDateString();
    return (jobsData as any[]).filter(
      (j) => j.status === 'COMPLETED' && new Date(j.startDate).toDateString() === today
    ).length;
  }
}

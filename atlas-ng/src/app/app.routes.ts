import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard, loginGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'data-sources',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Data Sources', icon: 'fa-database' },
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Search Vocabulary', icon: 'fa-search' },
      },
      {
        path: 'conceptsets',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Concept Sets', icon: 'fa-shopping-cart' },
      },
      {
        path: 'cohortdefinitions',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Cohort Definitions', icon: 'fa-users' },
      },
      {
        path: 'characterizations',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Characterizations', icon: 'fa-chart-line' },
      },
      {
        path: 'pathways',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Cohort Pathways', icon: 'fa-sitemap' },
      },
      {
        path: 'incidence-rates',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Incidence Rates', icon: 'fa-bolt' },
      },
      {
        path: 'profiles',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Profiles', icon: 'fa-user' },
      },
      {
        path: 'estimation',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Population Level Estimation', icon: 'fa-balance-scale' },
      },
      {
        path: 'prediction',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Patient Level Prediction', icon: 'fa-heartbeat' },
      },
      {
        path: 'reusables',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Reusables', icon: 'fa-recycle' },
      },
      {
        path: 'tagging',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Tagging', icon: 'fa-tags' },
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Jobs', icon: 'fa-tasks' },
      },
      {
        path: 'configure',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Configuration', icon: 'fa-cogs' },
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./shared/components/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent
          ),
        data: { title: 'Feedback', icon: 'fa-comment' },
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

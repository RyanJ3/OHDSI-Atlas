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
          import('./features/data-sources/data-sources.component').then(
            (m) => m.DataSourcesComponent
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search.component').then(
            (m) => m.SearchComponent
          ),
      },
      {
        path: 'conceptsets',
        loadComponent: () =>
          import('./features/concept-sets/concept-sets.component').then(
            (m) => m.ConceptSetsComponent
          ),
      },
      {
        path: 'cohortdefinitions',
        loadComponent: () =>
          import('./features/cohort-definitions/cohort-definitions.component').then(
            (m) => m.CohortDefinitionsComponent
          ),
      },
      {
        path: 'cohortdefinitions/:id/results',
        loadComponent: () =>
          import('./features/cohort-definitions/cohort-results/cohort-results.component').then(
            (m) => m.CohortResultsComponent
          ),
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
          import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
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

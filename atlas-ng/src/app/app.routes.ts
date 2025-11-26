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
          import('./features/characterizations/characterizations.component').then(
            (m) => m.CharacterizationsComponent
          ),
      },
      {
        path: 'pathways',
        loadComponent: () =>
          import('./features/pathways/pathways.component').then(
            (m) => m.PathwaysComponent
          ),
      },
      {
        path: 'incidence-rates',
        loadComponent: () =>
          import('./features/incidence-rates/incidence-rates.component').then(
            (m) => m.IncidenceRatesComponent
          ),
      },
      {
        path: 'profiles',
        loadComponent: () =>
          import('./features/profiles/profiles.component').then(
            (m) => m.ProfilesComponent
          ),
      },
      {
        path: 'estimation',
        loadComponent: () =>
          import('./features/estimation/estimation.component').then(
            (m) => m.EstimationComponent
          ),
      },
      {
        path: 'prediction',
        loadComponent: () =>
          import('./features/prediction/prediction.component').then(
            (m) => m.PredictionComponent
          ),
      },
      {
        path: 'reusables',
        loadComponent: () =>
          import('./features/reusables/reusables.component').then(
            (m) => m.ReusablesComponent
          ),
      },
      {
        path: 'tagging',
        loadComponent: () =>
          import('./features/tagging/tagging.component').then(
            (m) => m.TaggingComponent
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
      },
      {
        path: 'configure',
        loadComponent: () =>
          import('./features/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/feedback/feedback.component').then(
            (m) => m.FeedbackComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/user-settings/user-settings.component').then(
            (m) => m.UserSettingsComponent
          ),
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

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../core/store';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
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
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private store = inject(Store);

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
  }
}

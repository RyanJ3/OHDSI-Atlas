import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

export interface NavItem {
  title: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  @Input() expanded = true;

  navItems: NavItem[] = [
    { title: 'Home', icon: 'fa-home', route: '/home' },
    { title: 'Data Sources', icon: 'fa-database', route: '/data-sources' },
    { title: 'Search', icon: 'fa-search', route: '/search' },
    { title: 'Concept Sets', icon: 'fa-shopping-cart', route: '/conceptsets' },
    { title: 'Cohort Definitions', icon: 'fa-users', route: '/cohortdefinitions' },
    { title: 'Characterizations', icon: 'fa-chart-line', route: '/characterizations' },
    { title: 'Cohort Pathways', icon: 'fa-sitemap', route: '/pathways' },
    { title: 'Incidence Rates', icon: 'fa-bolt', route: '/incidence-rates' },
    { title: 'Profiles', icon: 'fa-user', route: '/profiles' },
    { title: 'Estimation', icon: 'fa-balance-scale', route: '/estimation' },
    { title: 'Prediction', icon: 'fa-heartbeat', route: '/prediction' },
    { title: 'Reusables', icon: 'fa-recycle', route: '/reusables' },
    { title: 'Tagging', icon: 'fa-tags', route: '/tagging' },
    { title: 'Jobs', icon: 'fa-tasks', route: '/jobs' },
    { title: 'Configuration', icon: 'fa-cogs', route: '/configure' },
    { title: 'Feedback', icon: 'fa-comment', route: '/feedback' },
  ];
}

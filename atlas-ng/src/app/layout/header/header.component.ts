import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { toggleSidenav } from '../../core/store';

interface User {
  login: string;
  name?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  user = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUser();
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

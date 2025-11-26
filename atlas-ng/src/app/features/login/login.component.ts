import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { selectAuthLoading, selectAuthError } from '../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo-container">
            <img src="images/Atlas_logo_rgb.png" alt="ATLAS" class="logo" />
          </div>
        </mat-card-header>

        <mat-card-content>
          <h2>Sign in to ATLAS</h2>
          <p class="subtitle">Enter your credentials to continue</p>

          @if (error$ | async; as error) {
            <div class="error-message">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                [(ngModel)]="username"
                name="username"
                placeholder="Enter your username"
                required
              />
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                required
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="login-button"
              [disabled]="isLoading$ | async"
            >
              @if (isLoading$ | async) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="demo-hint">
            <mat-icon>info</mat-icon>
            <span>Demo: use <strong>demo</strong> / <strong>demo</strong></span>
          </div>
        </mat-card-content>
      </mat-card>

      <p class="version">ATLAS v3.0.0 (Angular)</p>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .logo-container {
      width: 100%;
      text-align: center;
      margin-bottom: 20px;
    }

    .logo {
      max-width: 200px;
      height: auto;
    }

    mat-card-header {
      display: block;
      padding: 0;
    }

    mat-card-content {
      padding: 0;
    }

    h2 {
      text-align: center;
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 24px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .demo-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      padding: 12px;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 4px;
      font-size: 14px;
    }

    .demo-hint mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .version {
      margin-top: 24px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }

    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding-right: 8px !important;
    }
  `],
})
export class LoginComponent {
  private store = inject(Store);
  private router = inject(Router);

  username = '';
  password = '';
  hidePassword = true;

  isLoading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  onSubmit(): void {
    if (this.username && this.password) {
      // For demo, check hardcoded credentials
      if (this.username === 'demo' && this.password === 'demo') {
        // Store mock token
        localStorage.setItem('bearerToken', 'mock-jwt-token-for-demo-user');
        localStorage.setItem('atlas_user', JSON.stringify({
          login: 'demo',
          name: 'Demo User',
          permissions: [
            { permission: '*:*:*' } // All permissions for demo
          ]
        }));
        this.router.navigate(['/home']);
      } else {
        // Show error through a simple alert for now
        alert('Invalid credentials. Use demo/demo');
      }
    }
  }
}

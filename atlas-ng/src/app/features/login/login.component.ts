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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private store = inject(Store);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
        this.snackBar.open('Invalid credentials. Use demo/demo', 'OK', { duration: 4000 });
      }
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ConfigService } from '../config';
import * as AuthActions from '../store/auth/auth.actions';
import { User } from '../store/auth/auth.state';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface UserInfo {
  login: string;
  name?: string;
  permissions: { permission: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private store = inject(Store);

  private tokenKey = 'bearerToken';
  private authClientKey = 'auth-client';

  get token(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  }

  set token(value: string | null) {
    if (value) {
      localStorage.setItem(this.tokenKey, value);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  get authClient(): string | null {
    return localStorage.getItem(this.authClientKey);
  }

  set authClient(value: string | null) {
    if (value) {
      localStorage.setItem(this.authClientKey, value);
    } else {
      localStorage.removeItem(this.authClientKey);
    }
  }

  getAuthorizationHeader(): string | null {
    const token = this.token;
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Load current user info from the server
   */
  loadUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.config.webApiUrl}user/me`).pipe(
      tap((user) => {
        this.store.dispatch(
          AuthActions.loadUserInfoSuccess({
            user: {
              login: user.login,
              name: user.name,
              permissions: user.permissions,
            },
          })
        );
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.store.dispatch(
            AuthActions.loadUserInfoFailure({ error: 'User not authenticated' })
          );
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with credentials (for DB, LDAP, AD providers)
   */
  loginWithCredentials(
    providerUrl: string,
    credentials: LoginCredentials
  ): Observable<any> {
    const formData = new FormData();
    formData.append('login', credentials.login);
    formData.append('password', credentials.password);

    return this.http
      .post(`${this.config.webApiUrl}${providerUrl}`, formData, {
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          const token = response.headers.get('Bearer');
          if (token) {
            this.token = token;
            this.store.dispatch(AuthActions.setToken({ token }));
          }
        }),
        switchMap(() => this.loadUserInfo()),
        catchError((error) => {
          this.store.dispatch(
            AuthActions.loginFailure({ error: error.message || 'Login failed' })
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Login via AJAX (Windows, Kerberos)
   */
  loginViaAjax(providerUrl: string): Observable<any> {
    return this.http
      .get(`${this.config.webApiUrl}${providerUrl}`, {
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          const token = response.headers.get('Bearer');
          if (token) {
            this.token = token;
            this.store.dispatch(AuthActions.setToken({ token }));
          }
        }),
        switchMap(() => this.loadUserInfo()),
        catchError((error) => {
          this.store.dispatch(
            AuthActions.loginFailure({ error: error.message || 'Login failed' })
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Redirect-based login (OAuth, SAML, OpenID)
   */
  loginViaRedirect(providerUrl: string): void {
    window.location.href = `${this.config.webApiUrl}${providerUrl}`;
  }

  /**
   * Refresh the current token
   */
  refreshToken(): Observable<any> {
    if (!this.config.config.userAuthenticationEnabled) {
      return of(true);
    }

    return this.http
      .get(`${this.config.webApiUrl}user/refresh`, {
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          const token = response.headers.get('Bearer');
          if (token) {
            this.token = token;
            this.store.dispatch(AuthActions.refreshTokenSuccess({ token }));
          }
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout - clear all auth state
   */
  logout(): void {
    this.token = null;
    this.authClient = null;
    localStorage.removeItem('permissions');
    this.store.dispatch(AuthActions.logoutSuccess());
  }

  /**
   * Parse JWT token expiration
   */
  getTokenExpirationDate(): Date | null {
    const token = this.token;
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return true;
    return new Date() > expirationDate;
  }

  /**
   * Check if user has a specific permission
   */
  isPermitted(permission: string, userPermissions: string[]): boolean {
    if (!this.config.config.userAuthenticationEnabled) {
      return true;
    }

    if (!userPermissions?.length) {
      return false;
    }

    return userPermissions.some((etalon) =>
      this.checkPermission(permission, etalon)
    );
  }

  private checkPermission(permission: string, etalon: string): boolean {
    if (!etalon || !permission) return false;
    if (permission === etalon) return true;

    const etalonLevels = etalon.split(':');
    const permissionLevels = permission.split(':');

    if (etalonLevels.length !== permissionLevels.length) return false;

    for (let i = 0; i < permissionLevels.length; i++) {
      const pLevel = permissionLevels[i];
      const eLevels = etalonLevels[i].split(',');

      if (!eLevels.includes('*') && !eLevels.includes(pLevel)) {
        return false;
      }
    }

    return true;
  }
}

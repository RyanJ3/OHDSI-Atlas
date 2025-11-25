import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);

  loginWithCredentials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap((action) => {
        if (!action.credentials) {
          return of(
            AuthActions.loginFailure({ error: 'Credentials are required' })
          );
        }
        return this.authService
          .loginWithCredentials(action.provider, {
            login: action.credentials.username,
            password: action.credentials.password,
          })
          .pipe(
            map((userInfo) =>
              AuthActions.loginSuccess({
                token: this.authService.token || '',
                user: {
                  login: userInfo.login,
                  name: userInfo.name,
                  permissions: userInfo.permissions,
                },
              })
            ),
            catchError((error) =>
              of(
                AuthActions.loginFailure({
                  error:
                    error.error?.message || error.message || 'Login failed',
                })
              )
            )
          );
      })
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
        })
      ),
    { dispatch: false }
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map(() =>
            AuthActions.refreshTokenSuccess({
              token: this.authService.token || '',
            })
          ),
          catchError((error) =>
            of(
              AuthActions.refreshTokenFailure({
                error: error.message || 'Token refresh failed',
              })
            )
          )
        )
      )
    )
  );

  refreshTokenFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenFailure),
      map(() => AuthActions.logout())
    )
  );

  loadUserInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserInfo),
      switchMap(() =>
        this.authService.loadUserInfo().pipe(
          map((userInfo) =>
            AuthActions.loadUserInfoSuccess({
              user: {
                login: userInfo.login,
                name: userInfo.name,
                permissions: userInfo.permissions,
              },
            })
          ),
          catchError((error) =>
            of(
              AuthActions.loadUserInfoFailure({
                error: error.message || 'Failed to load user info',
              })
            )
          )
        )
      )
    )
  );

  checkStoredAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkStoredAuth),
      map(() => {
        const token = this.authService.token;
        if (token && !this.authService.isTokenExpired()) {
          // Token exists and is valid, load user info
          return AuthActions.loadUserInfo();
        }
        // No valid token
        return AuthActions.logoutSuccess();
      })
    )
  );
}

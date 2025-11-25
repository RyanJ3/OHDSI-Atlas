import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    user,
    token,
    tokenExpirationDate: parseTokenExpiration(token),
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error,
  })),

  // Load user info
  on(AuthActions.loadUserInfo, (state) => ({
    ...state,
    loading: true,
  })),

  on(AuthActions.loadUserInfoSuccess, (state, { user }) => ({
    ...state,
    isAuthenticated: true,
    user,
    loading: false,
  })),

  on(AuthActions.loadUserInfoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Set token
  on(AuthActions.setToken, (state, { token }) => ({
    ...state,
    token,
    tokenExpirationDate: parseTokenExpiration(token),
  })),

  // Refresh token
  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    tokenExpirationDate: parseTokenExpiration(token),
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Logout
  on(AuthActions.logout, AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
  }))
);

function parseTokenExpiration(token: string | null): Date | null {
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

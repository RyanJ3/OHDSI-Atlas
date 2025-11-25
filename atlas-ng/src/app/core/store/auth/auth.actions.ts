import { createAction, props } from '@ngrx/store';
import { User } from './auth.state';

// Login actions
export const login = createAction(
  '[Auth] Login',
  props<{ provider: string; credentials?: { username: string; password: string } }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Load user info
export const loadUserInfo = createAction('[Auth] Load User Info');

export const loadUserInfoSuccess = createAction(
  '[Auth] Load User Info Success',
  props<{ user: User }>()
);

export const loadUserInfoFailure = createAction(
  '[Auth] Load User Info Failure',
  props<{ error: string }>()
);

// Token actions
export const setToken = createAction(
  '[Auth] Set Token',
  props<{ token: string }>()
);

export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

// Logout
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Check permission
export const checkPermission = createAction(
  '[Auth] Check Permission',
  props<{ permission: string }>()
);

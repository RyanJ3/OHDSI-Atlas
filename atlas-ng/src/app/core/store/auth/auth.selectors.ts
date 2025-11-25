import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserPermissions = createSelector(
  selectUser,
  (user) => user?.permissions?.map(p => p.permission) || []
);

export const selectTokenExpirationDate = createSelector(
  selectAuthState,
  (state) => state.tokenExpirationDate
);

export const selectIsTokenExpired = createSelector(
  selectTokenExpirationDate,
  (expirationDate) => {
    if (!expirationDate) return true;
    return new Date() > expirationDate;
  }
);

// Permission checker selector factory
export const selectHasPermission = (permission: string) =>
  createSelector(selectUserPermissions, (permissions) => {
    if (!permissions.length) return false;

    return permissions.some((etalon) => checkPermission(permission, etalon));
  });

function checkPermission(permission: string, etalon: string): boolean {
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

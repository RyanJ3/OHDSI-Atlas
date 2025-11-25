import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.state';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectSidenavExpanded = createSelector(
  selectUiState,
  (state) => state.sidenavExpanded
);

export const selectLoading = createSelector(
  selectUiState,
  (state) => state.loading
);

export const selectPageTitle = createSelector(
  selectUiState,
  (state) => state.pageTitle
);

export const selectHasUnsavedChanges = createSelector(
  selectUiState,
  (state) => state.hasUnsavedChanges
);

export const selectFullPageTitle = createSelector(
  selectPageTitle,
  selectHasUnsavedChanges,
  (title, hasChanges) => {
    const prefix = hasChanges ? '*' : '';
    const suffix = hasChanges ? ' (unsaved)' : '';
    return `${prefix}ATLAS: ${title}${suffix}`;
  }
);

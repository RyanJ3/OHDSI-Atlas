import { createReducer, on } from '@ngrx/store';
import { initialUiState } from './ui.state';
import * as UiActions from './ui.actions';

export const uiReducer = createReducer(
  initialUiState,

  on(UiActions.toggleSidenav, (state) => ({
    ...state,
    sidenavExpanded: !state.sidenavExpanded,
  })),

  on(UiActions.setSidenavExpanded, (state, { expanded }) => ({
    ...state,
    sidenavExpanded: expanded,
  })),

  on(UiActions.setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),

  on(UiActions.setPageTitle, (state, { title }) => ({
    ...state,
    pageTitle: title,
  })),

  on(UiActions.setHasUnsavedChanges, (state, { hasChanges }) => ({
    ...state,
    hasUnsavedChanges: hasChanges,
  }))
);

import { createAction, props } from '@ngrx/store';

export const toggleSidenav = createAction('[UI] Toggle Sidenav');

export const setSidenavExpanded = createAction(
  '[UI] Set Sidenav Expanded',
  props<{ expanded: boolean }>()
);

export const setLoading = createAction(
  '[UI] Set Loading',
  props<{ loading: boolean }>()
);

export const setPageTitle = createAction(
  '[UI] Set Page Title',
  props<{ title: string }>()
);

export const setHasUnsavedChanges = createAction(
  '[UI] Set Has Unsaved Changes',
  props<{ hasChanges: boolean }>()
);

export interface UiState {
  sidenavExpanded: boolean;
  loading: boolean;
  pageTitle: string;
  hasUnsavedChanges: boolean;
}

export const initialUiState: UiState = {
  sidenavExpanded: true,
  loading: false,
  pageTitle: 'Home',
  hasUnsavedChanges: false,
};

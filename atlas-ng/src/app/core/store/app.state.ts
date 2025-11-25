import { AuthState } from './auth/auth.state';
import { UiState } from './ui/ui.state';

export interface AppState {
  auth: AuthState;
  ui: UiState;
}

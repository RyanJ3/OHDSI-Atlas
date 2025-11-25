export interface Permission {
  permission: string;
}

export interface User {
  login: string;
  name?: string;
  permissions: Permission[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpirationDate: Date | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  tokenExpirationDate: null,
  loading: false,
  error: null,
};

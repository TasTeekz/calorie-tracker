export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface LogoutRequest {
  refresh: string;
}

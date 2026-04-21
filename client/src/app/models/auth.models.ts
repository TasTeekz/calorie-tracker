export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
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

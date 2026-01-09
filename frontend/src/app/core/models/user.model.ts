export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  message?: string;
}


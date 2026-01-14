export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  message?: string;
}


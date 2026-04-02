export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  token: string;
  names?: string;
  lastNames?: string;
}

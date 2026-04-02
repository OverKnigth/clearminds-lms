import type { LoginCredentials, AuthUser } from '../entities/auth.entity';

export interface IAuthPort {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

import { api } from '../../../../shared/services/httpClient';
import type { IAuthPort } from '../../domain/ports/auth.port';
import type { LoginCredentials, AuthUser } from '../../domain/entities/auth.entity';

export class AuthHttpAdapter implements IAuthPort {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await api.login(credentials.email, credentials.password);
    const user = res.data?.user;
    return {
      id: user?.id ?? '',
      email: user?.email ?? credentials.email,
      role: user?.role ?? 'student',
      token: res.data?.accessToken ?? '',
      names: user?.names,
      lastNames: user?.lastNames,
    };
  }

  async logout(): Promise<void> {
    await api.logout();
  }

  async forgotPassword(email: string): Promise<void> {
    await api.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.resetPassword(token, newPassword);
  }
}

import type { IAuthPort } from '../../domain/ports/auth.port';
import type { LoginCredentials, AuthUser } from '../../domain/entities/auth.entity';

export async function loginUseCase(
  port: IAuthPort,
  credentials: LoginCredentials
): Promise<AuthUser> {
  return port.login(credentials);
}

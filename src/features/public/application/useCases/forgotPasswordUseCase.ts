import type { IAuthPort } from '../../domain/ports/auth.port';

export async function forgotPasswordUseCase(
  port: IAuthPort,
  email: string
): Promise<void> {
  return port.forgotPassword(email);
}

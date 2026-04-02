import type { IAuthPort } from '../../domain/ports/auth.port';

export async function resetPasswordUseCase(
  port: IAuthPort,
  token: string,
  newPassword: string
): Promise<void> {
  return port.resetPassword(token, newPassword);
}

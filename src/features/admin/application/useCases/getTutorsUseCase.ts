import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminTutor } from '../../domain/entities/admin.entity';

export async function getTutorsUseCase(
  port: IAdminPort,
  page?: number,
  limit?: number
): Promise<{ data: AdminTutor[]; total: number }> {
  return port.getTutors(page, limit);
}

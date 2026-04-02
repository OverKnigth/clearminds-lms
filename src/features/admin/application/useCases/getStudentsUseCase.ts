import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminStudent } from '../../domain/entities/admin.entity';

export async function getStudentsUseCase(
  port: IAdminPort,
  page?: number,
  limit?: number
): Promise<{ data: AdminStudent[]; total: number }> {
  return port.getStudents(page, limit);
}

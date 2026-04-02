import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminGroup } from '../../domain/entities/admin.entity';

export async function getGroupsUseCase(port: IAdminPort): Promise<AdminGroup[]> {
  return port.getGroups();
}

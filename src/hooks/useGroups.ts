import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Group, CreateGroupPayload, UpdateGroupPayload } from '../types/generation';

interface UseGroupsReturn {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  createGroup: (data: CreateGroupPayload) => Promise<Group>;
  updateGroup: (id: string, data: UpdateGroupPayload) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar grupos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (data: CreateGroupPayload): Promise<Group> => {
    const created = await api.createGroup(data);
    setGroups((prev) => [...prev, created]);
    return created;
  }, []);

  const updateGroup = useCallback(async (id: string, data: UpdateGroupPayload): Promise<Group> => {
    const updated = await api.updateGroup(id, data);
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<void> => {
    await api.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
}

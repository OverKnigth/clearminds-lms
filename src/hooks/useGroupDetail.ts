import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { GroupDetail, Parallel } from '../types/group';

interface UseGroupDetailReturn {
  detail: GroupDetail | null;
  isLoading: boolean;
  addCourses: (courseIds: string[]) => Promise<void>;
  createParallel: (name: string, blockIds?: string[]) => Promise<Parallel>;
  refetch: () => void;
}

export function useGroupDetail(groupId: string): UseGroupDetailReturn {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getGroupDetail(groupId);
      if (res.success) {
        setDetail(res.data);
      }
    } catch (err) {
      console.error('Error al cargar detalle del grupo:', err);
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const addCourses = useCallback(async (courseIds: string[]): Promise<void> => {
    await api.addCoursesToGroup(groupId, { courseIds });
    await fetchDetail();
  }, [groupId, fetchDetail]);

  const createParallel = useCallback(async (name: string, blockIds?: string[]): Promise<Parallel> => {
    const res = await api.createParallel(groupId, { name, blockIds });
    await fetchDetail();
    return res.data;
  }, [groupId, fetchDetail]);

  return {
    detail,
    isLoading,
    addCourses,
    createParallel,
    refetch: fetchDetail,
  };
}

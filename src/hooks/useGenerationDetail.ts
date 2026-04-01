import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { GenerationDetail, Parallel } from '../types/generation';

interface UseGenerationDetailReturn {
  detail: GenerationDetail | null;
  isLoading: boolean;
  addCourses: (courseIds: string[]) => Promise<void>;
  createParallel: (name: string) => Promise<Parallel>;
  refetch: () => void;
}

export function useGenerationDetail(generationId: string): UseGenerationDetailReturn {
  const [detail, setDetail] = useState<GenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getGenerationDetail(generationId);
      setDetail(data);
    } catch (err) {
      console.error('Error al cargar detalle de generación:', err);
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const addCourses = useCallback(async (courseIds: string[]): Promise<void> => {
    await api.addCoursesToGeneration(generationId, { courseIds });
    await fetchDetail();
  }, [generationId, fetchDetail]);

  const createParallel = useCallback(async (name: string): Promise<Parallel> => {
    const parallel = await api.createParallel(generationId, { name });
    await fetchDetail();
    return parallel;
  }, [generationId, fetchDetail]);

  return {
    detail,
    isLoading,
    addCourses,
    createParallel,
    refetch: fetchDetail,
  };
}

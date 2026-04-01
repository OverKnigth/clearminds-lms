import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Generation, CreateGenerationPayload, UpdateGenerationPayload } from '../types/generation';

interface UseGenerationsReturn {
  generations: Generation[];
  isLoading: boolean;
  error: string | null;
  createGeneration: (data: CreateGenerationPayload) => Promise<Generation>;
  updateGeneration: (id: string, data: UpdateGenerationPayload) => Promise<Generation>;
  deleteGeneration: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useGenerations(): UseGenerationsReturn {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getGenerations();
      setGenerations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar generaciones';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const createGeneration = useCallback(async (data: CreateGenerationPayload): Promise<Generation> => {
    const created = await api.createGeneration(data);
    setGenerations((prev) => [...prev, created]);
    return created;
  }, []);

  const updateGeneration = useCallback(async (id: string, data: UpdateGenerationPayload): Promise<Generation> => {
    const updated = await api.updateGeneration(id, data);
    setGenerations((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGeneration = useCallback(async (id: string): Promise<void> => {
    await (api as any).deleteGeneration(id);
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return {
    generations,
    isLoading,
    error,
    createGeneration,
    updateGeneration,
    deleteGeneration,
    refetch: fetchGenerations,
  };
}

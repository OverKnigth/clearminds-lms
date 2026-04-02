import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { ParallelDetail, EnrolledStudent } from '../types/group';

interface UseParallelDetailReturn {
  detail: ParallelDetail | null;
  students: EnrolledStudent[];
  isLoading: boolean;
  enrollStudents: (userIds: string[]) => Promise<void>;
  refetch: () => void;
}

export function useParallelDetail(parallelId: string): UseParallelDetailReturn {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getParallelStudents(parallelId);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Error al cargar estudiantes del paralelo:', err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [parallelId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const enrollStudents = useCallback(async (userIds: string[]): Promise<void> => {
    await api.enrollStudentsInParallel(parallelId, { userIds });
    await fetchStudents();
  }, [parallelId, fetchStudents]);

  const detail: ParallelDetail | null = students.length > 0 || !isLoading
    ? {
        id: parallelId,
        name: '',
        status: '',
        studentCount: students.length,
        cohortId: '',
        students,
        offerings: [],
      }
    : null;

  return {
    detail,
    students,
    isLoading,
    enrollStudents,
    refetch: fetchStudents,
  };
}

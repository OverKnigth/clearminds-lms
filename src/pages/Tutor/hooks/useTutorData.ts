import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { TutoringSession, TutorStudent, ChallengeSubmission } from '../types';

export const useTutorData = () => {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [students, setStudents] = useState<TutorStudent[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSubmission[]>([]);
  const [stats, setStats] = useState<{rating: number; reviewsCount: number}>({ rating: 0, reviewsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sr, str, cr, statsRes] = await Promise.allSettled([
        api.getTutorSessions(),
        api.getTutorStudents(),
        api.getTutorChallenges(),
        api.getTutorStats(),
      ]);
      if (sr.status === 'fulfilled' && sr.value.success) setSessions(sr.value.data);
      if (str.status === 'fulfilled' && str.value.success) setStudents(str.value.data);
      if (cr.status === 'fulfilled' && cr.value.success) setChallenges(cr.value.data);
      if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.getTutorSessions();
      if (res.success) setSessions(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pending = sessions.filter(s => s.status === 'requested');
  const upcoming = sessions.filter(s => s.status === 'confirmed' || s.status === 'rescheduled');
  const completed = sessions.filter(s => s.status === 'executed' || s.status === 'cancelled');

  return { sessions, students, challenges, stats, isLoading, fetchAll, fetchSessions, pending, upcoming, completed };
};

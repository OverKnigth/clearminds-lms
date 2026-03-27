import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { Course, Badge, Tutoring } from '../types';

export function useStudentData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tutorings, setTutorings] = useState<Tutoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallPct, setOverallPct] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, badgesRes, tutoringRes] = await Promise.allSettled([
        api.getStudentCourses(),
        api.getStudentBadges(),
        api.getStudentTutoring(),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value.success) {
        const list: Course[] = coursesRes.value.data;
        // Load progress for each course
        const withProgress = await Promise.all(
          list.map(async (c) => {
            try {
              const pr = await api.getCourseProgress(c.id);
              return { ...c, progress: pr.success ? pr.data : { total: 0, completed: 0, pct: 0 } };
            } catch { return { ...c, progress: { total: 0, completed: 0, pct: 0 } }; }
          })
        );
        setCourses(withProgress);
        if (withProgress.length > 0) {
          const avg = Math.round(withProgress.reduce((s, c) => s + (c.progress?.pct ?? 0), 0) / withProgress.length);
          setOverallPct(avg);
        }
      }
      if (badgesRes.status === 'fulfilled' && badgesRes.value.success) setBadges(badgesRes.value.data);
      if (tutoringRes.status === 'fulfilled' && tutoringRes.value.success) setTutorings(tutoringRes.value.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingTutorings = tutorings.filter(t => t.status === 'confirmed' || t.status === 'requested');

  return {
    userName,
    courses,
    badges,
    tutorings,
    upcomingTutorings,
    isLoading,
    overallPct,
    refetch: loadData
  };
}

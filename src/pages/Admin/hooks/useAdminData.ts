import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';

export const useAdminData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, tutorsRes, adminsRes, coursesRes, statsRes] = await Promise.allSettled([
        api.getAllUsers('student'),
        api.getAllUsers('tutor'),
        api.getAllUsers('admin'),
        api.getCourses(),
        api.getAdminStats()
      ]);

      const mapUser = (u: any) => ({
        id: u.id,
        fullName: `${u.names} ${u.lastNames}`,
        email: u.email,
        enrollmentDate: u.createdAt?.split('T')[0] || '2026-01-01',
        generation: 'Gen 2026-A',
        assignedCourses: [],
        progress: 0,
        status: u.status,
        role: u.role?.name || 'student'
      });

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.success) {
        const rows = studentsRes.value.rows || studentsRes.value.data || [];
        if (Array.isArray(rows)) setStudents(rows.map(mapUser));
      }
      if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.success) {
        const rows = tutorsRes.value.rows || tutorsRes.value.data || [];
        if (Array.isArray(rows)) setTutors(rows.map(mapUser));
      }
      if (adminsRes.status === 'fulfilled' && adminsRes.value?.success) {
        const rows = adminsRes.value.rows || adminsRes.value.data || [];
        if (Array.isArray(rows)) setAdmins(rows.map(mapUser));
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
        const data = coursesRes.value.data || [];
        if (Array.isArray(data)) {
          setCourses(data.map((c: any) => ({
            id: c.id,
            title: c.name || c.title,
            category: c.category || 'CURSO',
            modules: 0, videos: 0, students: 0
          })));
        }
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    students, setStudents,
    tutors, setTutors,
    admins, setAdmins,
    courses, setCourses,
    stats, setStats,
    isLoading, setIsLoading,
    fetchData
  };
};

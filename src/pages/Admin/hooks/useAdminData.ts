import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';

export const useAdminData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [studentsPage, setStudentsPage] = useState(1);
  const [tutorsPage, setTutorsPage] = useState(1);
  const [adminsPage, setAdminsPage] = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [tutorsTotal, setTutorsTotal] = useState(0);
  const [adminsTotal, setAdminsTotal] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, tutorsRes, adminsRes, coursesRes, statsRes] = await Promise.allSettled([
        api.getAllUsers('student', studentsPage, limit),
        api.getAllUsers('tutor', tutorsPage, limit),
        api.getAllUsers('admin', adminsPage, limit),
        api.getAdminCourses(),
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
        const total = studentsRes.value.total || 0;
        if (Array.isArray(rows)) setStudents(rows.map(mapUser));
        setStudentsTotal(total);
      }
      if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.success) {
        const rows = tutorsRes.value.rows || tutorsRes.value.data || [];
        const total = tutorsRes.value.total || 0;
        if (Array.isArray(rows)) setTutors(rows.map(mapUser));
        setTutorsTotal(total);
      }
      if (adminsRes.status === 'fulfilled' && adminsRes.value?.success) {
        const rows = adminsRes.value.rows || adminsRes.value.data || [];
        const total = adminsRes.value.total || 0;
        if (Array.isArray(rows)) setAdmins(rows.map(mapUser));
        setAdminsTotal(total);
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
        const data = coursesRes.value.data || [];
        if (Array.isArray(data)) {
          setCourses(data);
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
  }, [studentsPage, tutorsPage, adminsPage]);

  // Función específica para refrescar solo cursos
  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.getAdminCourses();
      if (response?.success) {
        const data = response.data || [];
        if (Array.isArray(data)) {
          setCourses(data);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    students, setStudents,
    tutors, setTutors,
    admins, setAdmins,
    courses, setCourses,
    stats, setStats,
    isLoading, setIsLoading,
    fetchData,
    fetchCourses,
    // Pagination
    studentsPage, setStudentsPage,
    tutorsPage, setTutorsPage,
    adminsPage, setAdminsPage,
    studentsTotal, tutorsTotal, adminsTotal,
    limit
  };
};

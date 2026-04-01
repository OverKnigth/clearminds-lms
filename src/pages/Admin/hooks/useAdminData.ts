import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';

export const useAdminData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
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
      // Corregido el orden de desestructuración para coincidir con el array de promesas
      const results = await Promise.allSettled([
        api.getAllUsers('student', studentsPage, limit),
        api.getAllUsers('tutor', tutorsPage, limit),
        api.getAllUsers('admin', adminsPage, limit),
        api.getAdminCourses(),
        api.getAllGroups(),
        api.getAdminStats(),
        api.getBadges(),
      ]);

      const [studentsRes, tutorsRes, adminsRes, coursesRes, groupsRes, statsRes, badgesRes] = results;

      const mapUser = (u: any) => ({
        id: u.id,
        fullName: `${u.names} ${u.lastNames}`,
        email: u.email,
        enrollmentDate: u.createdAt?.split('T')[0] || '2026-01-01',
        generation: u.generation || 'N/A',
        assignedCourses: u.assignedCourses || [],
        courseParallelMap: u.courseParallelMap || {},
        progress: u.progress || 0,
        status: u.status,
        role: u.role?.name || 'student',
        rating: u.rating || 0,
        reviewsCount: u.reviewsCount || 0
      });

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.success) {
        const rows = studentsRes.value.rows || studentsRes.value.data || [];
        setStudents(Array.isArray(rows) ? rows.map(mapUser) : []);
        setStudentsTotal(studentsRes.value.total || 0);
      }
      
      if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.success) {
        const rows = tutorsRes.value.rows || tutorsRes.value.data || [];
        setTutors(Array.isArray(rows) ? rows.map(mapUser) : []);
        setTutorsTotal(tutorsRes.value.total || 0);
      }

      if (adminsRes.status === 'fulfilled' && adminsRes.value?.success) {
        const rows = adminsRes.value.rows || adminsRes.value.data || [];
        setAdmins(Array.isArray(rows) ? rows.map(mapUser) : []);
        setAdminsTotal(adminsRes.value.total || 0);
      }

      if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
        setCourses(Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []);
      }

      if (groupsRes.status === 'fulfilled' && groupsRes.value?.success) {
        setGroups(Array.isArray(groupsRes.value.data) ? groupsRes.value.data : []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }

      if (badgesRes.status === 'fulfilled' && badgesRes.value?.success) {
        setBadges(Array.isArray(badgesRes.value.data) ? badgesRes.value.data : []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studentsPage, tutorsPage, adminsPage]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.getAdminCourses();
      if (response?.success) {
        setCourses(Array.isArray(response.data) ? response.data : []);
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
    groups, setGroups,
    stats, setStats,
    badges,
    isLoading, setIsLoading,
    fetchData,
    fetchCourses,
    studentsPage, setStudentsPage,
    tutorsPage, setTutorsPage,
    adminsPage, setAdminsPage,
    studentsTotal, tutorsTotal, adminsTotal,
    limit
  };
};

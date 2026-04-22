import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';

/** El API puede enviar `role` como string (dominio User) o como `{ name }` (Prisma). */
function mapApiRole(u: any): string {
  const r = u?.role;
  if (typeof r === 'string' && r) return r;
  if (r && typeof r === 'object' && typeof r.name === 'string') return r.name;
  return 'student';
}

const mapUser = (u: any): any => ({
  id: u.id,
  fullName: `${u.names} ${u.lastNames}`,
  email: u.email,
  enrollmentDate: u.createdAt?.split('T')[0] || '2026-01-01',
  generation: u.generation || 'N/A',
  groupId: u.groupId || '',
  generationName: u.generationName || '',
  groupName: u.groupName || '',
  assignedCourses: u.assignedCourses || [],
  courseParallelMap: u.courseParallelMap || {},
  progress: u.progress || 0,
  status: u.status,
  role: mapApiRole(u),
  rating: u.rating || 0,
  reviewsCount: u.reviewsCount || 0,
});

export const useAdminData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsSearch, setStudentsSearch] = useState('');
  const [studentsGroupId, setStudentsGroupId] = useState('all');
  const [tutorsPage, setTutorsPage] = useState(1);
  const [adminsPage, setAdminsPage] = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [tutorsTotal, setTutorsTotal] = useState(0);
  const [adminsTotal, setAdminsTotal] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getAllUsers('student', studentsPage, limit, studentsSearch, studentsGroupId),
        api.getAllUsers('tutor', tutorsPage, limit),
        api.getAllUsers('admin', adminsPage, limit),
        api.getAdminCourses(),
        api.getGroups(),
        api.getAdminStats(),
        api.getBadges(),
      ]);

      const [studentsRes, tutorsRes, adminsRes, coursesRes, groupsRes, statsRes, badgesRes] = results;

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.success) {
        setStudents(Array.isArray(studentsRes.value.rows || studentsRes.value.data) ? (studentsRes.value.rows || studentsRes.value.data).map(mapUser) : []);
        setStudentsTotal(studentsRes.value.total || 0);
      }
      if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.success) {
        setTutors(Array.isArray(tutorsRes.value.rows || tutorsRes.value.data) ? (tutorsRes.value.rows || tutorsRes.value.data).map(mapUser) : []);
        setTutorsTotal(tutorsRes.value.total || 0);
      }
      if (adminsRes.status === 'fulfilled' && adminsRes.value?.success) {
        setAdmins(Array.isArray(adminsRes.value.rows || adminsRes.value.data) ? (adminsRes.value.rows || adminsRes.value.data).map(mapUser) : []);
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
      if (showLoading) setIsLoading(false);
    }
  }, [studentsPage, tutorsPage, adminsPage, studentsSearch, studentsGroupId]);

  // Partial reload — only refreshes the specific role list after create/delete
  const fetchByRole = useCallback(async (role: 'student' | 'tutor' | 'admin', search?: string) => {
    try {
      const page = role === 'student' ? studentsPage : role === 'tutor' ? tutorsPage : adminsPage;
      const res = await api.getAllUsers(
        role, 
        page, 
        limit, 
        role === 'student' ? (search ?? studentsSearch) : undefined,
        role === 'student' ? studentsGroupId : undefined
      );
      
      if (!res?.success) return;
      const rows = res.rows || res.data || [];
      const mapped = Array.isArray(rows) ? rows.map(mapUser) : [];
      if (role === 'student') { setStudents(mapped); setStudentsTotal(res.total || 0); }
      if (role === 'tutor')   { setTutors(mapped);   setTutorsTotal(res.total || 0); }
      if (role === 'admin')   { setAdmins(mapped);   setAdminsTotal(res.total || 0); }
    } catch (e) { console.error(e); }
  }, [limit, studentsSearch, studentsPage, tutorsPage, adminsPage, studentsGroupId]);

  useEffect(() => {
    setStudentsPage(1);
  }, [studentsSearch, studentsGroupId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(studentsTotal / limit));
    if (studentsPage > totalPages) {
      setStudentsPage(totalPages);
    }
  }, [studentsPage, studentsTotal, limit]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.getAdminCourses();
      if (response?.success) setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) { console.error('Error fetching courses:', error); }
  }, []);

  useEffect(() => {
    // Initial fetch only once
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch only students when search, page or group changes
  useEffect(() => {
    fetchByRole('student');
  }, [studentsSearch, studentsGroupId, studentsPage, fetchByRole]);

  // Fetch only tutors when page changes
  useEffect(() => {
    fetchByRole('tutor');
  }, [tutorsPage, fetchByRole]);

  // Fetch only admins when page changes
  useEffect(() => {
    fetchByRole('admin');
  }, [adminsPage, fetchByRole]);

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
    fetchByRole,
    fetchCourses,
    studentsPage, setStudentsPage,
    studentsSearch, setStudentsSearch,
    studentsGroupId, setStudentsGroupId,
    tutorsPage, setTutorsPage,
    adminsPage, setAdminsPage,
    studentsTotal, tutorsTotal, adminsTotal,
    limit,
  };
};

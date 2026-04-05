import { useState } from 'react';
import type { Student } from '../../domain/entities';

export const useAdminFilters = (students: Student[]) => {
  const [assignmentFilter, setAssignmentFilter] = useState({ name: '', group: 'all' });
  const [progressFilter, setProgressFilter] = useState({ name: '', group: 'all', course: 'all' });

  const filteredStudentsForAssignments = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(assignmentFilter.name.toLowerCase());
    const matchesGroup = assignmentFilter.group === 'all' || student.groupName === assignmentFilter.group;
    return matchesName && matchesGroup;
  });

  const filteredStudentsForProgress = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(progressFilter.name.toLowerCase());
    const matchesGroup = progressFilter.group === 'all' || student.groupName === progressFilter.group;
    return matchesName && matchesGroup;
  });

  return {
    assignmentFilter, setAssignmentFilter,
    progressFilter, setProgressFilter,
    filteredStudentsForAssignments,
    filteredStudentsForProgress
  };
};

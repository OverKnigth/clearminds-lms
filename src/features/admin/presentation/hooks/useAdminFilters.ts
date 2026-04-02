import { useState } from 'react';
import type { Student } from '../../domain/entities';

export const useAdminFilters = (students: Student[]) => {
  const [assignmentFilter, setAssignmentFilter] = useState({ name: '', generation: 'all' });
  const [progressFilter, setProgressFilter] = useState({ name: '', generation: 'all', course: 'all' });

  const filteredStudentsForAssignments = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(assignmentFilter.name.toLowerCase());
    const matchesGeneration = assignmentFilter.generation === 'all' || student.generation === assignmentFilter.generation;
    return matchesName && matchesGeneration;
  });

  const filteredStudentsForProgress = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(progressFilter.name.toLowerCase());
    const matchesGeneration = progressFilter.generation === 'all' || student.generation === progressFilter.generation;
    return matchesName && matchesGeneration;
  });

  return {
    assignmentFilter, setAssignmentFilter,
    progressFilter, setProgressFilter,
    filteredStudentsForAssignments,
    filteredStudentsForProgress
  };
};

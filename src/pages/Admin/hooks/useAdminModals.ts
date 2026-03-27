import { useState } from 'react';
import type { Student, CourseData, FormData, ContentFormData, Tab } from '../types';

export const useAdminModals = (activeTab: Tab) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  
  const [modalType, setModalType] = useState<'addStudent' | 'editStudent' | 'addCourse' | 'editCourse' | 'assignCourse' | 'resetPassword' | 'editCourseContent'>('addStudent');
  const [contentModalType, setContentModalType] = useState<'addModule' | 'editModule' | 'addContent' | 'editContent'>('addContent');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
    generation: 'Gen 2026-A',
    selectedCourses: [],
  });

  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    type: 'video',
    title: '',
    description: '',
    duration: '',
    url: '',
    order: 1,
    requiresEvidence: false,
    requiresGithubLink: false,
    requiresTutorReview: false,
  });

  const openModal = (type: typeof modalType, student?: Student, course?: CourseData) => {
    setModalType(type);
    setSelectedStudent(student || null);
    setSelectedCourse(course || null);
    
    // Pre-fill form data when editing
    if (type === 'editStudent' && student) {
      const [firstName, ...lastNameParts] = student.fullName.split(' ');
      setFormData({
        firstName,
        lastName: lastNameParts.join(' '),
        email: student.email,
        password: '',
        role: (student.role as any) || 'student',
        status: student.status,
        generation: student.generation,
        selectedCourses: student.assignedCourses,
      });
    } else if (type === 'assignCourse' && student) {
      setFormData({
        ...formData,
        selectedCourses: student.assignedCourses,
      });
    } else {
      let defaultRole: 'student' | 'tutor' | 'admin' = 'student';
      if (activeTab === 'tutors') defaultRole = 'tutor';
      if (activeTab === 'admins') defaultRole = 'admin';
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: defaultRole,
        status: 'active',
        generation: 'Gen 2026-A',
        selectedCourses: [],
      });
    }
    
    setIsModalOpen(true);
  };

  const openContentModal = (type: typeof contentModalType, moduleId?: string) => {
    setContentModalType(type);
    setSelectedModuleId(moduleId || null);
    
    if (type === 'addContent' || type === 'addModule') {
      setContentFormData({
        type: 'video',
        title: '',
        description: '',
        duration: '',
        url: '',
        order: 1,
        requiresEvidence: false,
        requiresGithubLink: false,
        requiresTutorReview: false,
      });
    }
    
    setIsContentModalOpen(true);
  };

  const getContentModalTitle = () => {
    switch (contentModalType) {
      case 'addModule': return 'Agregar Nuevo Módulo';
      case 'editModule': return 'Editar Módulo';
      case 'addContent': return 'Agregar Video o Reto';
      case 'editContent': return contentFormData.type === 'video' ? 'Editar Video' : 'Editar Reto';
      default: return '';
    }
  };

  const getModalTitle = () => {
    const roleLabel = formData.role === 'tutor' ? 'Tutor' : formData.role === 'admin' ? 'Administrador' : 'Estudiante';
    
    switch (modalType) {
      case 'addStudent': return `Agregar Nuevo ${roleLabel}`;
      case 'editStudent': return `Editar ${roleLabel}`;
      case 'addCourse': return 'Crear Nuevo Curso';
      case 'editCourse': return 'Editar Curso';
      case 'editCourseContent': return 'Gestionar Contenido del Curso';
      case 'assignCourse': return 'Asignar Cursos';
      case 'resetPassword': return 'Restablecer Contraseña';
      default: return '';
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    isContentModalOpen, setIsContentModalOpen,
    modalType, contentModalType,
    selectedStudent, selectedCourse, selectedModuleId,
    formData, setFormData,
    contentFormData, setContentFormData,
    openModal, openContentModal,
    getContentModalTitle, getModalTitle
  };
};

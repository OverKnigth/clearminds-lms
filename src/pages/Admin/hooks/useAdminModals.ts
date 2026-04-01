import { useState } from 'react';
import type { Tab, Student, CourseData, FormData, ContentFormData } from '../types';

export function useAdminModals(activeTab: Tab) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [contentModalType, setContentModalType] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
    generationId: '',
    generation: '',
    groupId: '',
    selectedCourses: [],
    courseParallelMap: {},
  });

  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    order: 1,
    type: 'video',
    url: '',
    duration: '',
    requiresEvidence: false,
    requiresGithubLink: false,
    requiresTutorReview: false
  });

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    if (type === 'editStudent' && data) {
      setSelectedStudent(data);
      setFormData({
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        email: data.email,
        password: '',
        role: data.role,
        status: data.status,
        generationId: data.generationId || '',
        generation: data.generation || '',
        groupId: data.groupId || '',
        selectedCourses: data.assignedCourses || [],
        courseParallelMap: data.courseParallelMap || {},
      });
    } else if (type === 'addStudent') {
      setSelectedStudent(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
        status: 'active',
        generationId: '',
        generation: '',
        groupId: '',
        selectedCourses: [],
        courseParallelMap: {},
      });
    } else if (type === 'assignCourse' && data) {
      setSelectedStudent(data);
      setFormData({
        ...formData,
        selectedCourses: data.assignedCourses || [],
        courseParallelMap: data.courseParallelMap || {},
      });
    } else if (type === 'editCourse' && data) {
      setSelectedCourse(data);
      setFormData({
        ...formData,
        courseName: data.name,
        courseDescription: data.description || '',
        courseStatus: data.status,
        courseImageUrl: data.imageUrl || '',
      });
    } else if (type === 'addCourse') {
      setFormData({
        ...formData,
        courseName: '',
        courseDescription: '',
        courseStatus: 'active',
        courseImageUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const openContentModal = (type: string, moduleId?: string) => {
    setContentModalType(type);
    if (type === 'addModule') {
      setContentFormData({
        title: '',
        description: '',
        order: 1,
        type: 'video',
        url: '',
        duration: '',
        requiresEvidence: false,
        requiresGithubLink: false,
        requiresTutorReview: false
      });
    }
    setIsContentModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'addStudent': return 'Registrar Nuevo Estudiante';
      case 'addTutor': return 'Registrar Nuevo Tutor';
      case 'addAdmin': return 'Registrar Nuevo Administrador';
      case 'editStudent': return 'Editar Datos del Usuario';
      case 'assignCourse': return 'Asignación de Cursos Masiva';
      case 'resetPassword': return 'Restablecer Contraseña';
      case 'editCourse': return 'Editar Información del Curso';
      default: return 'Panel de Gestión';
    }
  };

  const getContentModalTitle = () => {
    switch (contentModalType) {
      case 'addModule': return 'Crear Nuevo Módulo';
      case 'editModule': return 'Editar Módulo';
      case 'addContent': return 'Agregar Contenido';
      case 'editContent': return 'Editar Contenido';
      default: return 'Gestionar Contenido';
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    isContentModalOpen, setIsContentModalOpen,
    modalType, contentModalType,
    selectedStudent, selectedCourse,
    formData, setFormData,
    contentFormData, setContentFormData,
    openModal, openContentModal,
    getContentModalTitle, getModalTitle
  };
}

import { useState, useRef } from 'react';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useAdminData } from './hooks/useAdminData';
import { useAdminModals } from './hooks/useAdminModals';
import type { Tab } from './types';
import {
  AdminHeader,
  StudentsTab,
  TutorsTab,
  AdminsTab,
  AdminModals
} from './components';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isUploading, setIsUploading] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const {
    students, setStudents,
    tutors,
    admins,
    courses,
    isLoading,
    fetchData
  } = useAdminData();

  const {
    isModalOpen, setIsModalOpen,
    isContentModalOpen, setIsContentModalOpen,
    modalType, contentModalType,
    selectedStudent, selectedCourse,
    formData, setFormData,
    contentFormData, setContentFormData,
    openModal, openContentModal,
    getContentModalTitle, getModalTitle
  } = useAdminModals(activeTab);

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalType === 'addStudent') {
        const payload: any = {
          names: formData.firstName,
          lastNames: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status
        };
        // Agregar cohortes/grupos luego si es necesario

        await api.createUser(payload);
        await fetchData(); // Refresh list
      } else if (modalType === 'editStudent' && selectedStudent) {
        // En un futuro implementar editUser
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al guardar estudiante');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await api.uploadUsersBulk(file);
      alert('Usuarios cargados exitosamente');
      await fetchData();
    } catch (error) {
      console.error('Error uploading users bulk:', error);
      alert('Error al cargar archivo de usuarios');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAssignCourses = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      setStudents(students.map(s =>
        s.id === selectedStudent.id
          ? { ...s, assignedCourses: formData.selectedCourses }
          : s
      ));
    }
    setIsModalOpen(false);
  };

  const toggleCourseSelection = (courseId: string) => {
    setFormData({
      ...formData,
      selectedCourses: formData.selectedCourses.includes(courseId)
        ? formData.selectedCourses.filter(id => id !== courseId)
        : [...formData.selectedCourses, courseId],
    });
  };



  const handleSubmitContent = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se guardaría el contenido en el backend
    console.log('Guardando contenido:', contentFormData);
    setIsContentModalOpen(false);
  };
  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          studentsCount={students.length}
          tutorsCount={tutors.length}
          adminsCount={admins.length}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse">Cargando datos del panel...</p>
          </div>
        ) : (
          <>
            {activeTab === 'students' && (
              <StudentsTab
                students={students}
                isUploading={isUploading}
                isImportMenuOpen={isImportMenuOpen}
                setIsImportMenuOpen={setIsImportMenuOpen}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
                openModal={openModal}
              />
            )}
            {activeTab === 'tutors' && (
              <TutorsTab tutors={tutors} openModal={openModal} />
            )}
            {activeTab === 'admins' && (
              <AdminsTab admins={admins} openModal={openModal} />
            )}
            {activeTab === 'courses' && (
              <div className="text-slate-400 text-center py-12">
                Pestaña de cursos en desarrollo
              </div>
            )}
            {activeTab === 'progress' && (
              <div className="text-slate-400 text-center py-12">
                Pestaña de progreso en desarrollo
              </div>
            )}
            {activeTab === 'assignments' && (
              <div className="text-slate-400 text-center py-12">
                Pestaña de asignaciones en desarrollo
              </div>
            )}
          </>
        )}
      </div>

      <AdminModals
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isContentModalOpen={isContentModalOpen}
        setIsContentModalOpen={setIsContentModalOpen}
        getModalTitle={getModalTitle}
        getContentModalTitle={getContentModalTitle}
        modalType={modalType}
        contentModalType={contentModalType}
        formData={formData}
        setFormData={setFormData}
        contentFormData={contentFormData}
        setContentFormData={setContentFormData}
        selectedStudent={selectedStudent || null}
        selectedCourse={selectedCourse || null}
        handleSubmitStudent={handleSubmitStudent}
        handleAssignCourses={handleAssignCourses}
        handleSubmitContent={handleSubmitContent}
        toggleCourseSelection={toggleCourseSelection}
        openContentModal={openContentModal}
        courses={courses}
      />
      <Footer />
    </div>
  );
}

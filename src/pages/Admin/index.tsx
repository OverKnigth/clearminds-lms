import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useAdminData } from './hooks/useAdminData';
import { useAdminModals } from './hooks/useAdminModals';
import type { Tab, CourseData, Student } from './types';
import {
  AdminHeader,
  StudentsTab,
  TutorsTab,
  AdminsTab,
  AdminModals,
  CoursesTab,
  CourseContentTab,
  AssignmentsTab,
  SubmissionsTab,
  TutoringSessionsTab,
  ProgressTab,
  AcademicBlocksTab,
  BadgesTab,
  DailyProgressTab
} from './components';
import { CourseFormModal, type CourseFormData } from './components/CourseFormModal';

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'students';
  const setActiveTab = (tab: Tab) => setSearchParams({ tab });

  const [isUploading, setIsUploading] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [managingContentCourse, setManagingContentCourse] = useState<CourseData | null>(null);
  const [managingBlocksCourse, setManagingBlocksCourse] = useState<CourseData | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState({ name: '', generation: 'all' });
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const {
    students,
    tutors,
    admins,
    courses,
    stats,
    isLoading,
    fetchData,
    fetchCourses,
    studentsPage, setStudentsPage,
    tutorsPage, setTutorsPage,
    adminsPage, setAdminsPage,
    studentsTotal, tutorsTotal, adminsTotal,
    limit
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
        
        await api.createUser(payload);
        await fetchData(); // Refresh list
        setIsModalOpen(false);
      } else if (modalType === 'editStudent' && selectedStudent) {
        // En un futuro implementar editUser
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar usuario';
      alert(errorMessage);
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

  const handleAssignCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.assignCoursesToUser(selectedStudent.id, formData.selectedCourses);
      await fetchData(); // Refresh list after assignment
      setIsModalOpen(false);
      alert(`Cursos asignados correctamente a ${selectedStudent.fullName}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al asignar cursos';
      alert(errorMessage);
    }
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
    console.log('Guardando contenido:', contentFormData);
    setIsContentModalOpen(false);
  };

  const handleToggleStatus = async (user: Student) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = newStatus === 'inactive' 
      ? `¿Desactivar a ${user.fullName}? No podrá iniciar sesión.`
      : `¿Activar a ${user.fullName}?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      await api.updateUserStatus(user.id, newStatus);
      await fetchData(); // Refresh list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar estado';
      alert(errorMessage);
    }
  };

  const handleOpenCourseModal = (type: 'add' | 'edit', course?: CourseData) => {
    setEditingCourse(type === 'edit' && course ? course : null);
    setIsCourseModalOpen(true);
  };

  const handleSubmitCourse = async (data: CourseFormData) => {
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, data);
      } else {
        await api.createCourse(data);
      }
      await fetchCourses(); 
      setIsCourseModalOpen(false);
      setEditingCourse(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar curso';
      alert(errorMessage);
      throw error;
    }
  };

  const handleToggleCourseStatus = async (course: CourseData) => {
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = newStatus === 'inactive' 
      ? `¿Desactivar el curso "${course.name}"?`
      : `¿Activar el curso "${course.name}"?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      await api.updateCourse(course.id, { status: newStatus });
      await fetchCourses(); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar estado del curso';
      alert(errorMessage);
    }
  };

  const toggleCourseForStudent = async (studentId: string, courseId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const isAssigned = student.assignedCourses.includes(courseId);
    const newCourses = isAssigned
      ? student.assignedCourses.filter(id => id !== courseId)
      : [...student.assignedCourses, courseId];

    try {
      await api.assignCoursesToUser(studentId, newCourses);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Error al actualizar cursos');
    }
  };

  const filteredStudentsForAssignments = students.filter(s => {
    const matchesName = s.fullName.toLowerCase().includes(assignmentFilter.name.toLowerCase());
    const matchesGen = assignmentFilter.generation === 'all' || s.generation === assignmentFilter.generation;
    return matchesName && matchesGen;
  });

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 -mt-2">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
              <p className="text-slate-400 text-sm mb-1">Estudiantes</p>
              <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
              <p className="text-slate-400 text-sm mb-1">Cursos</p>
              <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
              <p className="text-slate-400 text-sm mb-1">Grupos/Cohortes</p>
              <p className="text-3xl font-bold text-white">{stats.totalGroups}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-red-900/50 relative overflow-hidden group hover:border-red-500 transition-colors bg-gradient-to-b from-slate-800 to-red-900/10">
              <p className="text-slate-400 text-sm mb-1 text-red-300">Retos Atrasados</p>
              <p className="text-3xl font-bold text-red-500">{stats.behindStudents}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-green-900/50 relative overflow-hidden group hover:border-green-500 transition-colors bg-gradient-to-b from-slate-800 to-green-900/10">
              <p className="text-slate-400 text-sm mb-1 text-green-300">Avance Promedio</p>
              <p className="text-3xl font-bold text-green-500">{stats.avgGroupProgress}%</p>
            </div>
          </div>
        )}
        {/* AdminHeader was here, now in Sidebar */}

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
                currentPage={studentsPage}
                totalItems={studentsTotal}
                itemsPerPage={limit}
                onPageChange={setStudentsPage}
                onToggleStatus={handleToggleStatus}
              />
            )}
            {activeTab === 'tutors' && (
              <TutorsTab 
                tutors={tutors} 
                openModal={openModal}
                currentPage={tutorsPage}
                totalItems={tutorsTotal}
                itemsPerPage={limit}
                onPageChange={setTutorsPage}
                onToggleStatus={handleToggleStatus}
              />
            )}
            {activeTab === 'admins' && (
              <AdminsTab 
                admins={admins} 
                openModal={openModal}
                currentPage={adminsPage}
                totalItems={adminsTotal}
                itemsPerPage={limit}
                onPageChange={setAdminsPage}
                onToggleStatus={handleToggleStatus}
              />
            )}
            {activeTab === 'courses' && !managingContentCourse && (
              <CoursesTab
                courses={courses}
                isLoading={isLoading}
                openModal={(type, course) => handleOpenCourseModal(type === 'addCourse' ? 'add' : 'edit', course)}
                onToggleStatus={handleToggleCourseStatus}
                onManageContent={setManagingContentCourse}
                onManageBlocks={setManagingBlocksCourse}
              />
            )}
            {activeTab === 'courses' && managingContentCourse && (
              <CourseContentTab
                course={managingContentCourse}
                onBack={() => setManagingContentCourse(null)}
              />
            )}
            {activeTab === 'courses' && managingBlocksCourse && (
              <AcademicBlocksTab
                course={managingBlocksCourse}
                onBack={() => setManagingBlocksCourse(null)}
              />
            )}
            {activeTab === 'blocks' && !managingBlocksCourse && (
              <CoursesTab
                courses={courses}
                isLoading={isLoading}
                openModal={() => {}} // No modal here
                onToggleStatus={() => {}} // No toggle here
                onManageContent={() => {}} // No content here
                onManageBlocks={setManagingBlocksCourse}
              />
            )}
            {activeTab === 'progress' && (
              <ProgressTab />
            )}
            {activeTab === 'assignments' && (
              <AssignmentsTab 
                filteredStudentsForAssignments={filteredStudentsForAssignments}
                courses={courses}
                assignmentFilter={assignmentFilter}
                setAssignmentFilter={setAssignmentFilter}
                toggleCourseForStudent={toggleCourseForStudent}
              />
            )}
            {activeTab === 'submissions' && (
              <SubmissionsTab />
            )}
            {activeTab === 'tutoring' && (
              <TutoringSessionsTab />
            )}
            {activeTab === 'badges' && (
              <BadgesTab />
            )}
            {activeTab === 'daily-progress' && (
              <DailyProgressTab />
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
      
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        course={editingCourse}
        tutors={tutors.map(t => ({
          id: t.id,
          names: t.fullName.split(' ')[0],
          lastNames: t.fullName.split(' ').slice(1).join(' '),
          email: t.email
        }))}
      />
      
      <Footer />
    </div>
  );
}

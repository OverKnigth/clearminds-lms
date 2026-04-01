import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useAdminData } from './hooks/useAdminData';
import { useAdminModals } from './hooks/useAdminModals';
import { useDialog } from '../../hooks/useDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Tab, Student } from './types';
import {
  StudentsTab,
  TutorsTab,
  AdminsTab,
  AdminModals,
  CoursesTab,
  CourseContentTab,
  ProgressTab,
  BadgesTab,
  CourseManagementView,
  GenerationsTab,
} from './components';
import { GenerationDetailView } from './components/GenerationDetailView';
import { ParallelDetailView } from './components/ParallelDetailView';
import type { Generation, Parallel } from '../../types/generation';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'dashboard';

  const {
    students,
    tutors,
    admins,
    courses,
    groups,
    stats,
    badges,
    studentsPage,
    setStudentsPage,
    tutorsPage,
    setTutorsPage,
    adminsPage,
    setAdminsPage,
    studentsTotal,
    tutorsTotal,
    adminsTotal,
    isLoading,
    fetchData,
    limit
  } = useAdminData();

  const {
    isModalOpen, setIsModalOpen, isContentModalOpen, setIsContentModalOpen, modalType,
    contentModalType, selectedStudent, selectedCourse, formData, setFormData,
    contentFormData, setContentFormData, openModal, openContentModal, getModalTitle, getContentModalTitle
  } = useAdminModals(activeTab);

  const { dialog, close: closeDialog, showAlert, showConfirm } = useDialog();
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  
  const [managingContentCourse, setManagingContentCourse] = useState<any | null>(null);

  // ── Courses tab navigation state ──────────────────────────────────────────
  type CoursesView = 'list' | 'generationDetail' | 'parallelDetail' | 'blockManagement';
  const [coursesView, setCoursesView] = useState<CoursesView>('list');
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [selectedParallel, setSelectedParallel] = useState<Parallel | null>(null);
  const [selectedCourseForBlocks, setSelectedCourseForBlocks] = useState<any | null>(null);

  useEffect(() => {
    setManagingContentCourse(null);
    setCoursesView('list');
    setSelectedGeneration(null);
    setSelectedParallel(null);
    setSelectedCourseForBlocks(null);
  }, [activeTab]);

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);

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
          status: formData.status,
          generation: formData.generation,
          groupId: formData.groupId
        };
        await api.createUser(payload);
        await fetchData();
        setIsModalOpen(false);
      } else if (modalType === 'editStudent' && selectedStudent) {
        const payload: any = {
          names: formData.firstName,
          lastNames: formData.lastName,
          email: formData.email,
          status: formData.status,
          generation: formData.generation,
          groupId: formData.groupId
        };
        await (api as any).updateUser(selectedStudent.id, payload);
        await fetchData();
        setIsModalOpen(false);
      }
    } catch (error: any) { showAlert(error.response?.data?.message || 'Error al guardar usuario'); }
  };

  const handleToggleStatus = async (user: Student) => {
    const ns = user.status === 'active' ? 'inactive' : 'active';
    showConfirm('¿Cambiar el estado de este usuario?', async () => {
      try { await api.updateUserStatus(user.id, ns); await fetchData(); } catch (e: any) { showAlert(e.message); }
    }, { title: 'Cambiar Estado', confirmLabel: 'Cambiar' });
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.courseName,
        description: formData.courseDescription,
        imageUrl: formData.courseImageUrl,
        status: formData.courseStatus,
        slug: formData.courseName?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || ''
      };

      if (modalType === 'addCourse') {
        await api.createCourse(payload);
      } else if (modalType === 'editCourse' && selectedCourse) {
        await api.updateCourse(selectedCourse.id, payload);
      }
      
      await fetchData();
      setIsModalOpen(false);
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    const isSelected = formData.selectedCourses.includes(courseId);
    let newSelected = [...formData.selectedCourses];
    let newMap = { ...formData.courseParallelMap };

    if (isSelected) {
      newSelected = newSelected.filter(id => id !== courseId);
      delete (newMap as any)[courseId];
    } else {
      newSelected.push(courseId);
      // Opcionalmente: Si hay un solo paralelo disponible para este curso, asignarlo por defecto
      const availableGroup = groups.find(g => g.offerings?.some((off: any) => off.course_id === courseId));
      const offering = availableGroup?.offerings?.find((off: any) => off.course_id === courseId);
      if (offering) {
        (newMap as any)[courseId] = offering.id;
      }
    }

    setFormData({ ...formData, selectedCourses: newSelected, courseParallelMap: newMap });
  };

  const handleAssignCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const selectedOfferings = Object.values(formData.courseParallelMap || {}).filter(id => id);
      
      if (selectedOfferings.length === 0) {
        showAlert('Selecciona al menos un curso con su paralelo para asignar.');
        return;
      }

      for (const offeringId of selectedOfferings) {
        await (api as any).enrollStudents(offeringId, { userIds: [selectedStudent.id] });
      }

      await fetchData();
      setIsModalOpen(false);
      showAlert('Cursos e Instancias asignados correctamente.', 'Éxito');
    } catch (e: any) { 
      showAlert(e.response?.data?.message || 'Error al asignar cursos');
    } finally { setSaving(false); }
  };

  const [assignmentFilter, setAssignmentFilter] = useState({ name: '', generation: 'all' });
  const filteredStudentsForAssignments = students.filter(s => {
    const matchName = s.fullName.toLowerCase().includes(assignmentFilter.name.toLowerCase()) || 
                      s.email.toLowerCase().includes(assignmentFilter.name.toLowerCase());
    const matchGen = assignmentFilter.generation === 'all' || s.generation === assignmentFilter.generation;
    return matchName && matchGen;
  });

  const toggleCourseForStudent = async (studentId: string, courseId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const isAssigned = student.assignedCourses.includes(courseId);
      const newCourses = isAssigned 
        ? student.assignedCourses.filter(id => id !== courseId)
        : [...student.assignedCourses, courseId];
      
      await api.assignCoursesToUser(studentId, newCourses);
      await fetchData();
    } catch (e: any) { showAlert(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <div className="flex-1 w-full px-6 py-6">

        {isLoading && activeTab !== 'dashboard' ? (
          <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
                  <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Panel de Administración</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Resumen general de la plataforma</p>
                  </div>
                </div>

                {/* Stats cards */}
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Estudiantes Activos', value: stats.totalStudents, color: 'text-white', bg: 'bg-slate-800', border: 'border-slate-700/50' },
                      { label: 'Cursos Disponibles', value: stats.totalCourses, color: 'text-white', bg: 'bg-slate-800', border: 'border-slate-700/50' },
                      { label: 'Alerta de Avance', value: stats.behindStudents, color: 'text-red-500', bg: 'bg-red-900/10', border: 'border-red-900/40' },
                      { label: 'Cumplimiento Global', value: `${stats.avgGroupProgress}%`, color: 'text-green-500', bg: 'bg-green-900/10', border: 'border-green-900/40' },
                    ].map(({ label, value, color, bg, border }) => (
                      <div key={label} className={`${bg} rounded-lg p-5 border ${border} shadow-lg text-center`}>
                        <p className="text-slate-400 text-[10px] mb-2 uppercase font-black tracking-widest">{label}</p>
                        <p className={`text-4xl font-black ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" /></div>
                )}

                {/* Bottom 3-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Ranking de Tutores */}
                  <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking de Tutores</p>
                        <p className="text-xs text-slate-500 mt-0.5">Por calificación promedio</p>
                      </div>
                      <a href="/admin?tab=tutors" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Ver todos →</a>
                    </div>
                    <div className="divide-y divide-slate-700/30">
                      {tutors.length === 0 ? (
                        <p className="px-5 py-8 text-center text-[10px] text-slate-600 uppercase font-black">Sin tutores registrados</p>
                      ) : (
                        [...tutors]
                          .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
                          .slice(0, 5)
                          .map((tutor: any, i) => (
                            <div key={tutor.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/20 transition-colors">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                i === 1 ? 'bg-slate-500/20 text-slate-300' :
                                i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                'bg-slate-700 text-slate-500'
                              }`}>{i + 1}</span>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                {tutor.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{tutor.fullName}</p>
                                <p className="text-[10px] text-slate-500">{tutor.reviewsCount || 0} reseñas</p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-[10px] font-black text-yellow-400">{(tutor.rating || 0).toFixed(1)}</span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Estadística de usuarios */}
                  <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribución de Usuarios</p>
                      <p className="text-xs text-slate-500 mt-0.5">Por rol en la plataforma</p>
                    </div>
                    <div className="p-5 space-y-4">
                      {[
                        { label: 'Estudiantes', count: studentsTotal, total: studentsTotal + tutorsTotal + adminsTotal, color: 'bg-blue-500' },
                        { label: 'Tutores', count: tutorsTotal, total: studentsTotal + tutorsTotal + adminsTotal, color: 'bg-purple-500' },
                        { label: 'Administradores', count: adminsTotal, total: studentsTotal + tutorsTotal + adminsTotal, color: 'bg-red-500' },
                      ].map(({ label, count, total, color }) => {
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={label}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                              <span className="text-[10px] font-black text-slate-400">{count} <span className="text-slate-600">({pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total usuarios</span>
                        <span className="text-lg font-black text-white">{studentsTotal + tutorsTotal + adminsTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Insignias */}
                  <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insignias</p>
                        <p className="text-xs text-slate-500 mt-0.5">Resumen de logros</p>
                      </div>
                      <a href="/admin?tab=badges" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Ver todas →</a>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-center">
                          <p className="text-5xl font-black text-white">{badges.length}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Insignias creadas</p>
                        </div>
                      </div>
                      {badges.length === 0 ? (
                        <p className="text-center text-[10px] text-slate-600 uppercase font-black py-4">Sin insignias creadas</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
                          {badges.slice(0, 6).map((badge: any) => (
                            <div key={badge.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                                {badge.icon || '🏅'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{badge.name}</p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold truncate">{badge.course?.name || badge.category || 'General'}</p>
                              </div>
                            </div>
                          ))}
                          {badges.length > 6 && (
                            <p className="text-center text-[9px] text-slate-600 uppercase font-black pt-1">+{badges.length - 6} más</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Quick access */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Acceso Rápido</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Estudiantes', tab: 'students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', colorIcon: 'text-blue-400', colorBg: 'bg-blue-500/10' },
                      { label: 'Gestión de Cursos', tab: 'courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', colorIcon: 'text-red-400', colorBg: 'bg-red-500/10' },
                      { label: 'Progreso', tab: 'progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', colorIcon: 'text-green-400', colorBg: 'bg-green-500/10' },
                      { label: 'Retos', tab: 'submissions', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', colorIcon: 'text-purple-400', colorBg: 'bg-purple-500/10' },
                    ].map(({ label, tab, icon, colorIcon, colorBg }) => (
                      <a key={tab} href={`/admin?tab=${tab}`}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg p-4 flex items-center gap-3 transition-all group">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorBg} flex-shrink-0`}>
                          <svg className={`w-5 h-5 ${colorIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                          </svg>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MÓDULOS ── */}
            {activeTab === 'students' && (
              <StudentsTab 
                students={students}
                groups={groups}
                isUploading={false} 
                isImportMenuOpen={isImportMenuOpen} 
                setIsImportMenuOpen={setIsImportMenuOpen} 
                fileInputRef={fileInputRef} 
                handleFileUpload={async () => {}} 
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
                onToggleStatus={handleToggleStatus} 
                currentPage={tutorsPage}
                totalItems={tutorsTotal}
                itemsPerPage={limit}
                onPageChange={setTutorsPage}
              />
            )}

            {activeTab === 'admins' && (
              <AdminsTab 
                admins={admins} 
                openModal={openModal} 
                onToggleStatus={handleToggleStatus} 
                currentPage={adminsPage}
                totalItems={adminsTotal}
                itemsPerPage={limit}
                onPageChange={setAdminsPage}
              />
            )}
            
            {activeTab === 'courses' && !managingContentCourse && (
              <>
                {coursesView === 'list' && (
                  <GenerationsTab
                    onSelectGeneration={(generation) => {
                      setSelectedGeneration(generation);
                      setCoursesView('generationDetail');
                    }}
                  />
                )}
                {coursesView === 'generationDetail' && selectedGeneration && (
                  <GenerationDetailView
                    generation={selectedGeneration}
                    onBack={() => setCoursesView('list')}
                    onManageBlocks={(course) => {
                      setSelectedCourseForBlocks(course);
                      setCoursesView('blockManagement');
                    }}
                    onSelectParallel={(parallel) => {
                      setSelectedParallel(parallel);
                      setCoursesView('parallelDetail');
                    }}
                  />
                )}
                {coursesView === 'parallelDetail' && selectedParallel && selectedGeneration && (
                  <ParallelDetailView
                    parallel={selectedParallel}
                    generationId={selectedGeneration.id}
                    onBack={() => setCoursesView('generationDetail')}
                  />
                )}
                {coursesView === 'blockManagement' && selectedCourseForBlocks && (
                  <CourseManagementView
                    course={selectedCourseForBlocks}
                    onBack={() => setCoursesView('generationDetail')}
                    hideParallelsTab={true}
                  />
                )}
              </>
            )}

            {activeTab === 'progress' && <ProgressTab />}
            {activeTab === 'badges' && <BadgesTab />}

            {/* ── CATÁLOGO DE CURSOS ── */}
            {activeTab === 'catalog' && !managingContentCourse && (
              <CoursesTab
                courses={courses}
                isLoading={isLoading}
                openModal={openModal}
                onToggleStatus={async (course) => {
                  const ns = course.status === 'active' ? 'inactive' : 'active';
                  showConfirm('¿Cambiar el estado de este curso?', async () => {
                    try { await api.updateCourse(course.id, { status: ns }); await fetchData(); } catch (e: any) { showAlert(e.message); }
                  }, { title: 'Cambiar Estado', confirmLabel: 'Cambiar' });
                }}
                onManageContent={setManagingContentCourse}
                onManageBlocks={setManagingContentCourse}
                onDelete={async (course) => {
                  showConfirm(`¿Eliminar el curso "${course.name}"? Esta acción no se puede deshacer.`, async () => {
                    try { await api.deleteCourse(course.id); await fetchData(); } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
                  }, { title: 'Eliminar Curso', confirmLabel: 'Eliminar', danger: true });
                }}
                title="Cursos"
                subtitle="Crea y administra los cursos base de la plataforma"
                hideBlocksAction={true}
              />
            )}
            {activeTab === 'badges' && <BadgesTab />}

            {managingContentCourse && (
              <CourseContentTab 
                course={managingContentCourse} 
                onBack={() => setManagingContentCourse(null)} 
              />
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
        handleSubmitContent={() => {}} 
        handleSubmitCourse={handleSubmitCourse}
        toggleCourseSelection={toggleCourseSelection} 
        openContentModal={openContentModal} 
        courses={courses} 
        groups={groups} 
      />

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        danger={dialog.danger}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
      
      <Footer />
    </div>
  );
}

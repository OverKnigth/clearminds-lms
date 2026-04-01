import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { api } from '../../../services/api';
import type { Student, CourseData, FormData, ContentFormData } from '../types';
import type { Generation, GenerationDetail } from '../../../types/generation';

interface AdminModalsProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  isContentModalOpen: boolean;
  setIsContentModalOpen: (val: boolean) => void;
  getModalTitle: () => string;
  getContentModalTitle: () => string;
  modalType: string;
  contentModalType: string;
  formData: FormData;
  setFormData: (val: FormData) => void;
  contentFormData: ContentFormData;
  setContentFormData: (val: ContentFormData) => void;
  selectedStudent: Student | null;
  selectedCourse: CourseData | null;
  handleSubmitStudent: (e: React.FormEvent) => void;
  handleAssignCourses: (e: React.FormEvent) => void;
  handleSubmitContent: (e: React.FormEvent) => void;
  handleSubmitCourse: (e: React.FormEvent) => void;
  toggleCourseSelection: (courseId: string) => void;
  openContentModal: (type: any, moduleId?: string) => void;
  courses: CourseData[];
  groups: any[];
}

export function AdminModals({
  isModalOpen, setIsModalOpen,
  isContentModalOpen, setIsContentModalOpen,
  getModalTitle, getContentModalTitle,
  modalType, contentModalType,
  formData, setFormData,
  contentFormData, setContentFormData,
  selectedStudent, selectedCourse,
  handleSubmitStudent, handleAssignCourses, handleSubmitContent, handleSubmitCourse,
  toggleCourseSelection, openContentModal, courses, groups
}: AdminModalsProps) {
  // ── Cascading generation → course → parallel selection ──────────────────────
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [generationDetail, setGenerationDetail] = useState<GenerationDetail | null>(null);
  const [selectedGenerationId, setSelectedGenerationId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingGenerations, setLoadingGenerations] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const formDataRef = React.useRef(formData);
  formDataRef.current = formData;

  // Load generations when modal opens for addStudent
  useEffect(() => {
    if (isModalOpen && (modalType === 'addStudent' || modalType === 'editStudent')) {
      setLoadingGenerations(true);
      api.getGenerations()
        .then(setGenerations)
        .catch(() => setGenerations([]))
        .finally(() => setLoadingGenerations(false));
    }
    if (!isModalOpen) {
      setSelectedGenerationId('');
      setSelectedCourseId('');
      setGenerationDetail(null);
    }
  }, [isModalOpen, modalType]);

  // Load generation detail when a generation is selected
  useEffect(() => {
    if (!selectedGenerationId) {
      setGenerationDetail(null);
      setSelectedCourseId('');
      setFormData({ ...formDataRef.current, generationId: '', generation: '', groupId: '' });
      return;
    }
    setLoadingDetail(true);
    setSelectedCourseId('');
    setFormData({ ...formDataRef.current, generationId: selectedGenerationId, generation: '', groupId: '' });
    api.getGenerationDetail(selectedGenerationId)
      .then(setGenerationDetail)
      .catch(() => setGenerationDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedGenerationId]);

  // Filter parallels that have an offering for the selected course
  const availableParallels = generationDetail
    ? generationDetail.parallels.filter(() =>
        !selectedCourseId ||
        generationDetail.courses.some(c => c.course.id === selectedCourseId)
      )
    : [];

  return (
    <>
      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()}>
        {/* Add Student Form */}
        {modalType === 'addStudent' && (
          <form onSubmit={handleSubmitStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombres</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Pérez López"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña Inicial</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'tutor' | 'admin' })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="student">Estudiante</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            {(formData.role === 'student' || formData.role === 'tutor') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Generación (Opcional)</label>
                  <select
                    value={selectedGenerationId}
                    onChange={(e) => setSelectedGenerationId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter text-xs"
                    disabled={loadingGenerations}
                  >
                    <option value="">-- No Asignar Generación --</option>
                    {generations.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                {selectedGenerationId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Curso (Opcional)</label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          setFormData({ ...formData, generationId: selectedGenerationId, generation: e.target.value, groupId: '' });
                        }}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter text-xs"
                        disabled={loadingDetail}
                      >
                        <option value="">-- No Asignar Curso --</option>
                        {generationDetail?.courses.map(c => (
                          <option key={c.course.id} value={c.course.id}>{c.course.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Paralelo (Opcional)</label>
                      <select
                        value={formData.groupId}
                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter text-xs"
                        disabled={loadingDetail || availableParallels.length === 0}
                      >
                        <option value="">-- No Asignar Paralelo --</option>
                        {availableParallels.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Student Form */}
        {modalType === 'editStudent' && selectedStudent && (
          <EditStudentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmitStudent}
            onCancel={() => setIsModalOpen(false)}
          />
        )}

        {/* Assign Courses Form */}
        {modalType === 'assignCourse' && selectedStudent && (
          <form onSubmit={handleAssignCourses} className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-red-400 text-sm">
                Asignando cursos a <span className="font-semibold">{selectedStudent.fullName}</span>
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300 mb-3 font-black uppercase tracking-widest text-[10px]">Selecciona los cursos e Instancias</label>
              {courses.map(course => (
                <div key={course.id} className={`p-4 rounded-2xl border transition-all ${formData.selectedCourses.includes(course.id) ? 'bg-slate-800 border-red-500/50 shadow-lg shadow-red-900/5' : 'bg-slate-800/40 border-slate-700/50'}`}>
                  <label className="flex items-center gap-4 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-5 h-5 rounded-lg border-slate-600 text-red-600 focus:ring-offset-0 focus:ring-red-600 bg-slate-700"
                    />
                    <div className="flex-1">
                      <p className="text-white font-black uppercase tracking-tighter text-lg">{course.name}</p>
                      {course.description && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{course.description}</p>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${course.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                      {course.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </label>

                  {formData.selectedCourses.includes(course.id) && (
                    <div className="pl-9 animate-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Asignar a Paralelo (Instancia)</label>
                        <select
                          value={formData.courseParallelMap?.[course.id] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            courseParallelMap: {
                              ...formData.courseParallelMap,
                              [course.id]: e.target.value
                            }
                          })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-black uppercase tracking-tighter text-xs"
                        >
                          <option value="">-- SELECCIONAR PARALELO --</option>
                          {groups
                            .filter(g => g.offerings?.some((off: any) => off.course_id === course.id))
                            .map(group => {
                              const offering = group.offerings?.find((off: any) => off.course_id === course.id);
                              return (
                                <option key={group.id} value={offering?.id}>{group.name}</option>
                              );
                            })
                          }
                        </select>
                        <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">
                          * El alumno se inscribirá en el plan de estudios de este paralelo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Asignar Cursos ({formData.selectedCourses.length})
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {modalType === 'resetPassword' && selectedStudent && (
          <form className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
              <p className="text-yellow-400 text-sm">
                Vas a restablecer la contraseña de <span className="font-semibold">{selectedStudent.fullName}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nueva Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-lg transition-all"
              >
                Restablecer Contraseña
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Course Info Form */}
        {modalType === 'editCourse' && selectedCourse && (
          <form onSubmit={handleSubmitCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Título del Curso</label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Descripción</label>
              <textarea
                rows={3}
                value={formData.courseDescription}
                onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium uppercase tracking-tighter"
                placeholder="Descripción del curso..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Imagen del Curso (Subir)</label>
                <div className="flex items-center gap-4">
                  {formData.courseImageUrl && (
                    <img src={formData.courseImageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-600" />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 text-xs font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-all text-center">
                      {formData.courseImageUrl ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await api.uploadCourseImage(file, formData.courseName);
                            if (res.success) {
                              setFormData({ ...formData, courseImageUrl: res.data.imageUrl });
                            }
                          } catch (err: any) {
                            alert('Error al subir imagen: ' + err.message);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Estado</label>
                <select
                  value={formData.courseStatus}
                  onChange={(e) => setFormData({ ...formData, courseStatus: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-widest text-xs"
                >
                  <option value="active">ACTIVO</option>
                  <option value="inactive">INACTIVO</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase tracking-widest rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Course Content Form */}
        {modalType === 'editCourseContent' && selectedCourse && (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                Gestionando contenido de <span className="font-semibold">{selectedCourse.name}</span>
              </p>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
              {/* Module 1 */}
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="text-white font-semibold">Módulo 1: Introducción al Desarrollo Web</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openContentModal('editModule', 'm1')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: ¿Qué es el Desarrollo Web?</p>
                        <p className="text-xs text-slate-400">Duración: 12:30 • Orden: 1</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: '¿Qué es el Desarrollo Web?', duration: '12:30', order: 1 });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: HTML y CSS Moderno</p>
                        <p className="text-xs text-slate-400">Duración: 18:45 • Orden: 2</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: 'HTML y CSS Moderno', duration: '18:45', order: 2 });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Reto: Crea tu Primera Página Web</p>
                        <p className="text-xs text-slate-400">Requiere revisión de tutor • Orden: 3</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'challenge', title: 'Crea tu Primera Página Web', order: 3, requiresTutorReview: true });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <button
                    onClick={() => openContentModal('addContent', 'm1')}
                    className="w-full py-2.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Video o Reto
                  </button>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="text-white font-semibold">Módulo 2: JavaScript Avanzado</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openContentModal('editModule', 'm2')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: Funciones y Closures</p>
                        <p className="text-xs text-slate-400">Duración: 22:15 • Orden: 1</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: 'Funciones y Closures', duration: '22:15', order: 1 });
                        openContentModal('editContent', 'm2');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <button
                    onClick={() => openContentModal('addContent', 'm2')}
                    className="w-full py-2.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Video o Reto
                  </button>
                </div>
              </div>

              <button
                onClick={() => openContentModal('addModule')}
                className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Nuevo Módulo
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Add Course Form */}
        {modalType === 'addCourse' && (
          <form onSubmit={handleSubmitCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Título del Curso</label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter"
                placeholder="Ej: Desarrollo Web Full Stack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Descripción</label>
              <textarea
                rows={3}
                required
                value={formData.courseDescription}
                onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium uppercase tracking-tighter"
                placeholder="Descripción del curso..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-black uppercase tracking-widest text-[10px]">Imagen del Curso (Subir)</label>
              <div className="flex items-center gap-4">
                {formData.courseImageUrl && (
                  <img src={formData.courseImageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-600 shadow-xl" />
                )}
                <label className="flex-1 cursor-pointer group">
                  <div className="px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest group-hover:border-red-500 group-hover:text-red-400 transition-all text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {formData.courseImageUrl ? 'CAMBIAR IMAGEN ' : 'SUBIR IMAGEN'}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await api.uploadCourseImage(file, formData.courseName);
                          if (res.success) {
                            setFormData({ ...formData, courseImageUrl: res.data.imageUrl });
                          }
                        } catch (err: any) {
                          alert('Error al subir imagen: ' + err.message);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase tracking-widest rounded-lg transition-all shadow-lg"
              >
                Crear Curso
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest rounded-lg transition-colors border border-slate-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Content Modal (Secondary Modal for adding/editing videos and challenges) */}
      <Modal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} title={getContentModalTitle()}>
        {(contentModalType === 'addModule' || contentModalType === 'editModule') && (
          <form onSubmit={handleSubmitContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Módulo</label>
              <input
                type="text"
                required
                value={contentFormData.title}
                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Introducción al Desarrollo Web"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={contentFormData.description}
                onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del módulo..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Orden</label>
              <input
                type="number"
                required
                min="1"
                value={contentFormData.order}
                onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                {contentModalType === 'addModule' ? 'Crear Módulo' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {(contentModalType === 'addContent' || contentModalType === 'editContent') && (
          <form onSubmit={handleSubmitContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Contenido</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="video"
                    checked={contentFormData.type === 'video'}
                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value as 'video' | 'challenge' })}
                    className="w-4 h-4 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-white">Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="challenge"
                    checked={contentFormData.type === 'challenge'}
                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value as 'video' | 'challenge' })}
                    className="w-4 h-4 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-white">Reto</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
              <input
                type="text"
                required
                value={contentFormData.title}
                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={contentFormData.type === 'video' ? 'Ej: Introducción a React' : 'Ej: Crea tu primera aplicación'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={contentFormData.description}
                onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del contenido..."
              />
            </div>

            {contentFormData.type === 'video' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL del Video</label>
                  <input
                    type="url"
                    required
                    value={contentFormData.url}
                    onChange={(e) => setContentFormData({ ...contentFormData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duración (mm:ss)</label>
                  <input
                    type="text"
                    required
                    value={contentFormData.duration}
                    onChange={(e) => setContentFormData({ ...contentFormData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="12:30"
                  />
                </div>
              </>
            )}

            {contentFormData.type === 'challenge' && (
              <div className="space-y-3 p-4 bg-slate-700 rounded-lg">
                <p className="text-sm font-medium text-slate-300 mb-3">Configuración del Reto</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresEvidence}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresEvidence: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere evidencia (imágenes)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresGithubLink}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresGithubLink: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere link de GitHub</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresTutorReview}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresTutorReview: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere revisión de tutor</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Orden</label>
              <input
                type="number"
                required
                min="1"
                value={contentFormData.order}
                onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                {contentModalType === 'addContent' ? 'Agregar Contenido' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

// ── EditStudentForm — uses Generation → Course → Parallel flow ───────────────
function EditStudentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: {
  formData: FormData;
  setFormData: (v: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [generationDetail, setGenerationDetail] = useState<any | null>(null);
  const [selectedGenerationId, setSelectedGenerationId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Track if user has actively changed the generation (to avoid clearing on mount)
  const [generationChanged, setGenerationChanged] = useState(false);
  const formDataRef = React.useRef(formData);
  formDataRef.current = formData;

  // Load generations on mount
  useEffect(() => {
    api.getGenerations().then(setGenerations).catch(() => {});
  }, []);

  // Load generation detail when user actively selects a generation
  useEffect(() => {
    if (!generationChanged) return;
    if (!selectedGenerationId) {
      setGenerationDetail(null);
      setSelectedCourseId('');
      setFormData({ ...formDataRef.current, generationId: '', generation: '', groupId: '' });
      return;
    }
    setLoadingDetail(true);
    setSelectedCourseId('');
    setFormData({ ...formDataRef.current, generationId: selectedGenerationId, generation: '', groupId: '' });
    api.getGenerationDetail(selectedGenerationId)
      .then(setGenerationDetail)
      .catch(() => setGenerationDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedGenerationId, generationChanged]);

  const availableParallels = generationDetail ? generationDetail.parallels : [];

  const INPUT = 'w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500';
  const LABEL = 'block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Nombres</label>
          <input required className={INPUT} value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>Apellidos</label>
          <input required className={INPUT} value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Correo Electrónico</label>
        <input type="email" required className={INPUT} value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      </div>

      {/* Generation selector */}
      <div>
        <label className={LABEL}>Cambiar Generación (Opcional)</label>
        <select
          className={INPUT + ' font-bold uppercase tracking-tighter text-xs'}
          value={selectedGenerationId}
          onChange={(e) => {
            setGenerationChanged(true);
            setSelectedGenerationId(e.target.value);
          }}
        >
          <option value="">-- Mantener asignación actual --</option>
          {generations.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Course + Parallel selectors — only shown when user actively picks a generation */}
      {selectedGenerationId && generationChanged && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Curso</label>
            <select
              className={INPUT + ' font-bold uppercase tracking-tighter text-xs'}
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setFormData({ ...formDataRef.current, generationId: selectedGenerationId, generation: e.target.value, groupId: '' });
              }}
              disabled={loadingDetail}
            >
              <option value="">-- Sin curso --</option>
              {generationDetail?.courses.map((c: any) => (
                <option key={c.course.id} value={c.course.id}>{c.course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Paralelo</label>
            <select
              className={INPUT + ' font-bold uppercase tracking-tighter text-xs'}
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formDataRef.current, groupId: e.target.value })}
              disabled={loadingDetail || availableParallels.length === 0}
            >
              <option value="">
                {loadingDetail ? 'Cargando...' : '-- Sin paralelo --'}
              </option>
              {availableParallels.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.studentCount} estudiante{p.studentCount !== 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all">
          Guardar Cambios
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

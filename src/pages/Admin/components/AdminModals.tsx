import React from 'react';
import Modal from '../../../components/Modal';
import type { Student, CourseData, FormData, ContentFormData } from '../types';

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
  toggleCourseSelection: (courseId: string) => void;
  openContentModal: (type: any, moduleId?: string) => void;
  courses: CourseData[];
}

export function AdminModals({
  isModalOpen, setIsModalOpen,
  isContentModalOpen, setIsContentModalOpen,
  getModalTitle, getContentModalTitle,
  modalType, contentModalType,
  formData, setFormData,
  contentFormData, setContentFormData,
  selectedStudent, selectedCourse,
  handleSubmitStudent, handleAssignCourses, handleSubmitContent,
  toggleCourseSelection, openContentModal, courses
}: AdminModalsProps) {
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Grupo o Cohorte</label>
                <select 
                  value={formData.generation}
                  onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Gen 2026-A">Gen 2026-A</option>
                  <option value="Gen 2026-B">Gen 2026-B</option>
                  <option value="Gen 2025-B">Gen 2025-B</option>
                </select>
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Generación</label>
              <select 
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Gen 2026-A</option>
                <option>Gen 2026-B</option>
                <option>Gen 2025-B</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
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

        {/* Assign Courses Form */}
        {modalType === 'assignCourse' && selectedStudent && (
          <form onSubmit={handleAssignCourses} className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-red-400 text-sm">
                Asignando cursos a <span className="font-semibold">{selectedStudent.fullName}</span>
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300 mb-3">Selecciona los cursos</label>
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.selectedCourses.includes(course.id)}
                    onChange={() => toggleCourseSelection(course.id)}
                    className="w-5 h-5 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{course.name}</p>
                    {course.description && <p className="text-sm text-slate-400">{course.description}</p>}
                    {course.tutors && course.tutors.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tutores: {course.tutors.map(t => t.names).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {course.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
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
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título del Curso</label>
              <input
                type="text"
                required
                defaultValue={selectedCourse.title}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <select 
                defaultValue={selectedCourse.category}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>DESARROLLO</option>
                <option>CLOUD</option>
                <option>DATA</option>
                <option>DATABASE</option>
                <option>DEVOPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del curso..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
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

        {/* Edit Course Content Form */}
        {modalType === 'editCourseContent' && selectedCourse && (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                Gestionando contenido de <span className="font-semibold">{selectedCourse.title}</span>
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
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título del Curso</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Desarrollo Web Full Stack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>DESARROLLO</option>
                <option>CLOUD</option>
                <option>DATA</option>
                <option>DATABASE</option>
                <option>DEVOPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del curso..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Imagen URL</label>
              <input
                type="url"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Crear Curso
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

import type { RefObject } from 'react';
import type { Student } from '../types';

interface StudentsTabProps {
  students: Student[];
  isUploading: boolean;
  isImportMenuOpen: boolean;
  setIsImportMenuOpen: (isOpen: boolean) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openModal: (type: 'addStudent' | 'editStudent' | 'assignCourse' | 'resetPassword', student?: Student) => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (student: Student) => void;
}

export function StudentsTab({
  students,
  isUploading,
  isImportMenuOpen,
  setIsImportMenuOpen,
  fileInputRef,
  handleFileUpload,
  openModal,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onToggleStatus
}: StudentsTabProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Gestión de Estudiantes</h2>
          <p className="text-sm text-slate-400">Administra usuarios, credenciales y asignaciones</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
              disabled={isUploading}
              className={`px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              {isUploading ? 'Importando...' : 'Importar'}
              {!isUploading && (
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {isImportMenuOpen && !isUploading && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
                <button
                  onClick={() => {
                    setIsImportMenuOpen(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = ".xlsx,.xls,.csv";
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Desde Excel / CSV
                </button>
                <button
                  onClick={() => {
                    setIsImportMenuOpen(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = ".pdf";
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Desde PDF
                </button>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
          <button
            onClick={() => openModal('addStudent')}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Estudiante
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Generación</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Cursos</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Progreso</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-semibold">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{student.fullName}</p>
                      <p className="text-xs text-slate-400">ID: {student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">{student.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded">
                    {student.generation}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{student.assignedCourses.length} cursos</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-20">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-700"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(student)}
                    className={`px-2 py-1 text-xs font-semibold rounded transition-all hover:opacity-80 cursor-pointer ${
                      student.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                    title={`Click para ${student.status === 'active' ? 'desactivar' : 'activar'}`}
                  >
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal('editStudent', student)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => openModal('assignCourse', student)}
                      className="text-red-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Asignar
                    </button>
                    <button 
                      onClick={() => openModal('resetPassword', student)}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Mostrando {students.length} de {totalItems} estudiantes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-slate-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

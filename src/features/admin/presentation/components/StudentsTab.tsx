import type { RefObject } from 'react';
import type { Student } from '../../domain/entities';
import { UserAvatar } from '../../../../shared/components/UserAvatar';

interface StudentsTabProps {
  students: Student[];
  groups: any[];
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
  onDelete?: (student: Student) => void;
}

export function StudentsTab({
  students,
  groups: _groups,
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
  onToggleStatus,
  onDelete
}: StudentsTabProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // getParallelNames — available for future use
  const getGroupName = (student: Student): string => {
    if ((student as any).groupName) return (student as any).groupName;
    return '—';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de Estudiantes</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Administra usuarios, credenciales y asignaciones</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
              disabled={isUploading}
              className={`px-6 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              {isUploading ? 'Importando...' : 'Importar'}
              {!isUploading && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {isImportMenuOpen && !isUploading && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-20">
                <button
                  onClick={() => {
                    setIsImportMenuOpen(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = ".xlsx,.xls,.csv";
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
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
                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
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
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Estudiante
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700/50 overflow-hidden shadow-xl">
        <table className="w-full">
          <thead className="bg-slate-900/60 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Correo</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Grupo</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Cursos</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-700/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-red-400 transition-colors truncate">{student.fullName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-mono">{student.email}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                    {getGroupName(student)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {student.assignedCourses.length} curso{student.assignedCourses.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-20">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(student)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                      student.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    }`}
                    title={`Click para ${student.status === 'active' ? 'desactivar' : 'activar'}`}
                  >
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal('editStudent', student)} title="Editar"
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => openModal('assignCourse', student)} title="Asignar curso"
                      className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </button>
                    <button onClick={() => openModal('resetPassword', student)} title="Restablecer contraseña"
                      className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                    {onDelete && (
                      <button onClick={() => onDelete(student)} title="Eliminar"
                        className="p-2 rounded-lg bg-red-900/10 hover:bg-red-900/30 text-red-500 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay estudiantes registrados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Mostrando {students.length} de {totalItems} estudiantes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  currentPage === 1
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-600 text-xs">…</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  currentPage === totalPages
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

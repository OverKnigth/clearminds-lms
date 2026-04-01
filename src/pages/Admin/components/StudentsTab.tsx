import type { RefObject } from 'react';
import type { Student } from '../types';

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
}

export function StudentsTab({
  students,
  groups,
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

  const getParallelNames = (student: Student): string => {
    const map = student.courseParallelMap;
    if (!map || Object.keys(map).length === 0) return 'Sin Paralelo';
    
    // El mapa contiene IDs (pueden ser groupId o offeringId)
    const assignedIds = Object.values(map).filter(Boolean);
    
    const names = groups
      .filter(g => {
        // Opción 1: El ID es el groupId
        if (assignedIds.includes(g.id)) return true;
        // Opción 2: El ID es un offeringId perteneciente a este grupo
        return g.offerings?.some((off: any) => assignedIds.includes(off.id));
      })
      .map(g => g.name);

    return names.length > 0 ? names.join(', ') : 'Sin Paralelo';
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
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Paralelo/s</th>
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
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-black uppercase shadow-md shadow-red-900/30">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-red-400 transition-colors">{student.fullName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-mono">{student.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border whitespace-nowrap bg-red-500/10 text-red-400 border-red-500/20">
                    {getParallelNames(student)}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('editStudent', student)}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all border border-slate-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => openModal('assignCourse', student)}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all border border-red-600/20"
                    >
                      Asignar
                    </button>
                    <button
                      onClick={() => openModal('resetPassword', student)}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 transition-all border border-yellow-500/20"
                    >
                      Reset
                    </button>
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

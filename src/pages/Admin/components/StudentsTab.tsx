import { useState, useEffect, type RefObject } from 'react';
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
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDelete?: (student: Student) => void;
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
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
  onToggleStatus,
  searchTerm,
  onSearchChange,
  onDelete,
  selectedGroupId,
  onGroupChange
}: StudentsTabProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchTerm]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // getParallelNames — available for future use
  const getGroupName = (student: Student): string => {
    if ((student as any).groupName) return (student as any).groupName;
    // Use generationName from backend if available
    if ((student as any).generationName) return (student as any).generationName;
    // Fallback: search in groups
    const map = student.courseParallelMap;
    if (!map || Object.keys(map).length === 0) return '—';
    const assignedIds = Object.values(map).filter(Boolean);
    const matchedGroup = groups.find(g => {
      if (assignedIds.includes(g.id)) return true;
      return g.offerings?.some((off: any) => assignedIds.includes(off.id));
    });
    return matchedGroup?.cohortName || matchedGroup?.cohort || '—';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Estudiantes</h2>
              <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Admin Mode</div>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestión global de usuarios, accesos y métricas de progreso</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group/import">
              <button
                onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
                disabled={isUploading}
                className={`flex-1 lg:flex-none px-6 py-3 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-slate-900/50'}`}
              >
                {isUploading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-slate-400 group-hover/import:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                {isUploading ? 'Importando Datos...' : 'Importar Usuarios'}
                {!isUploading && (
                  <svg className={`w-3 h-3 transition-transform duration-300 ${isImportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {isImportMenuOpen && !isUploading && (
                <div className="absolute top-full right-0 mt-3 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-slate-800 bg-slate-800/30">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Seleccionar Origen</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = ".xlsx,.xls,.csv";
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3 group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Excel / CSV
                  </button>
                  <button
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = ".pdf";
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3 group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Documento PDF
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
              className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Estudiante
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Search & Filters Section */}
      <div className="flex flex-col xl:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por nombre, correo electrónico o identificación..."
            className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 focus:border-red-500/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all backdrop-blur-sm"
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
              title="Limpiar búsqueda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <select
              value={selectedGroupId}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full pl-10 pr-10 py-4 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 focus:border-red-500/50 rounded-2xl text-xs text-white appearance-none focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all backdrop-blur-sm cursor-pointer font-black uppercase tracking-widest"
            >
              <option value="all">Filtrar por Grupo / Generación</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name || g.cohortName || g.cohort}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 w-full sm:w-auto justify-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total:</span>
            <span className="text-sm font-black text-white">{totalItems}</span>
          </div>
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
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-black uppercase shadow-md shadow-red-900/30">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-red-400 transition-colors">{student.fullName}</p>
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
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {searchTerm ? 'No hay resultados para la búsqueda' : 'No hay estudiantes registrados'}
                  </p>
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

import { useState, useEffect } from 'react';
import { useGroupDetail } from '../../../hooks/useGroupDetail';
import { api } from '../../../services/api';
import type { Group } from '../../../types/generation';
import type { CourseData, Student } from '../types';
import Modal from '../../../components/Modal';

interface GroupDetailViewProps {
  group: Group;
  onBack: () => void;
  onManageBlocks: (course: CourseData) => void;
}

const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-colors';

export function GroupDetailView({
  group,
  onBack,
  onManageBlocks,
}: GroupDetailViewProps) {
  const { detail, isLoading, addCourses } = useGroupDetail(group.id);

  // ── Add Courses Modal ──────────────────────────────────────────────────────
  const [isAddCoursesOpen, setIsAddCoursesOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [addingCourses, setAddingCourses] = useState(false);
  const [addCoursesError, setAddCoursesError] = useState<string | null>(null);

  // Load all courses when modal opens, then filter out already-assigned ones
  useEffect(() => {
    if (!isAddCoursesOpen) return;
    setCoursesLoading(true);
    setSelectedCourseIds([]);
    setAddCoursesError(null);
    api
      .getAdminCourses()
      .then((res) => {
        const all: CourseData[] = Array.isArray(res) ? res : (res?.data ?? []);
        const assignedIds = new Set((detail?.courses ?? []).map((c) => c.course.id));
        setAvailableCourses(all.filter((c) => !assignedIds.has(c.id)));
      })
      .catch(() => setAvailableCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [isAddCoursesOpen, detail?.courses]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddCourses = async () => {
    if (selectedCourseIds.length === 0) return;
    setAddingCourses(true);
    setAddCoursesError(null);
    try {
      await addCourses(selectedCourseIds);
      setIsAddCoursesOpen(false);
    } catch (err: any) {
      setAddCoursesError(err?.message ?? 'Error al agregar cursos. Intenta de nuevo.');
    } finally {
      setAddingCourses(false);
    }
  };

  // ── Enrollment Modal ───────────────────────────────────────────────────────
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState<CourseData | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [enrollSearch, setEnrollSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnrollOpen) return;
    setStudentsLoading(true);
    // Fetch all students to pick from
    api.getAllUsers('student', 1, 1000)
      .then(res => { 
        const rows = res.rows || res.data || [];
        const mapped = Array.isArray(rows) ? rows.map((u: any) => ({
          id: u.id,
          fullName: `${u.names} ${u.lastNames}`,
          email: u.email,
          status: u.status,
          // other fields if needed, but the list only uses fullName and email
        })) : [];
        setAllStudents(mapped as Student[]); 
      })
      .catch(() => setAllStudents([]))
      .finally(() => setStudentsLoading(false));
  }, [isEnrollOpen]);

  const handleOpenEnroll = (course: CourseData) => {
    setEnrollingCourse(course);
    setEnrollSearch('');
    setSelectedStudentIds([]);
    setEnrollError(null);
    setIsEnrollOpen(true);
  };

  const filteredStudents = allStudents.filter(s => 
    (s.fullName.toLowerCase().includes(enrollSearch.toLowerCase()) || 
     s.email.toLowerCase().includes(enrollSearch.toLowerCase()))
  );

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleEnrollStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      // Logic for enrolling in group
      await api.enrollStudentsInGroup(group.id, { userIds: selectedStudentIds });
      setIsEnrollOpen(false);
      // Optional: refetch group detail to show updated student count if we had one
    } catch (err: any) {
      setEnrollError(err?.message ?? 'Error al matricular estudiantes');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 flex-shrink-0"
          aria-label="Volver"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {group.name}
          </h2>
          {group.description && (
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* ── Courses Section ─────────────────────────────────────────── */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tighter">
                  Cursos
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Cursos asignados a este grupo
                </p>
              </div>
              <button
                onClick={() => setIsAddCoursesOpen(true)}
                className={BTN_PRIMARY + ' text-[10px]'}
              >
                + Agregar cursos
              </button>
            </div>

            {detail?.courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-3 border border-slate-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168 0.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332 0.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332 0.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tighter mb-1">
                  Sin cursos asignados
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-5">
                  Agrega cursos para definir el plan académico de este grupo
                </p>
                <button
                  onClick={() => setIsAddCoursesOpen(true)}
                  className={BTN_PRIMARY + ' text-[10px]'}
                >
                  Agregar cursos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {detail?.courses.map(({ offeringId, course }) => (
                  <div
                    key={offeringId}
                    className="group bg-slate-800/40 border border-slate-700 hover:border-red-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-600/10 transition-colors" />

                    <div className="mb-4">
                      <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168 0.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332 0.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332 0.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter line-clamp-1 mb-1">
                        {course.name}
                      </h4>
                      {course.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 h-8">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-2">
                      <button
                        onClick={() => handleOpenEnroll(course)}
                        className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Matricular estudiantes
                      </button>
                      <button
                        onClick={() => onManageBlocks(course)}
                        className="w-full px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-red-600/20"
                      >
                        Gestionar bloques
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Add Courses Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddCoursesOpen}
        onClose={() => setIsAddCoursesOpen(false)}
        title="Agregar Cursos"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-400">
            Selecciona los cursos que deseas agregar a este grupo.
          </p>

          {coursesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="p-6 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black">
                No hay cursos disponibles para agregar
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-64 overflow-y-auto space-y-1">
              {availableCourses.map((course) => {
                const selected = selectedCourseIds.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
                      checked={selected}
                      onChange={() => toggleCourse(course.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white uppercase truncate">
                        {course.name}
                      </p>
                    </div>
                    {selected && (
                      <span className="text-[9px] font-black text-red-400 uppercase shrink-0">✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {addCoursesError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-bold">{addCoursesError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCoursesOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={addingCourses || selectedCourseIds.length === 0}
              onClick={handleAddCourses}
              className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {addingCourses ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar cursos'
              )}
            </button>
          </div>
        </div>
      </Modal>
      {/* ── Enrollment Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        title={`Matricular Estudiantes`}
      >
        <div className="space-y-6">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-4">
              Matriculación para <span className="text-white italic">{group.name}</span>
            </p>
            <div className="relative group">
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-600/30 focus:border-red-600/30 transition-all"
                placeholder="Buscar por nombre o email..."
                value={enrollSearch}
                onChange={(e) => setEnrollSearch(e.target.value)}
              />
              <div className="absolute left-3.5 top-3.5 text-slate-600 group-focus-within:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-slate-700/30 rounded-2xl overflow-hidden bg-slate-900/20">
            <div className="border-b border-slate-700/30 p-4 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newIds = [...new Set([...selectedStudentIds, ...filteredStudents.map(s => s.id)])];
                      setSelectedStudentIds(newIds);
                    } else {
                      const filteredIds = new Set(filteredStudents.map(s => s.id));
                      setSelectedStudentIds(selectedStudentIds.filter(id => !filteredIds.has(id)));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-red-600 focus:ring-offset-slate-900" 
                />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Seleccionar todos</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedStudentIds.length} seleccionados</span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {studentsLoading ? (
                <div className="py-16 flex flex-col items-center gap-4">
                   <div className="w-8 h-8 border-2 border-red-500/10 border-t-red-600 rounded-full animate-spin" />
                   <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Sincronizando alumnos...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-16 text-center border-b border-slate-800/50">
                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Sin resultados</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/30">
                  {filteredStudents.map(student => (
                    <label key={student.id} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 cursor-pointer transition-all">
                      <input 
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-red-600 focus:ring-offset-slate-900" 
                      />
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                        {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate">{student.fullName}</p>
                        <p className="text-[9px] text-slate-600 font-bold truncate">{student.email}</p>
                      </div>
                      {selectedStudentIds.includes(student.id) && (
                        <span className="text-[10px] text-red-600 font-black">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {enrollError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{enrollError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsEnrollOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              disabled={enrolling || selectedStudentIds.length === 0}
              onClick={handleEnrollStudents}
              className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {enrolling ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Matriculando...</>
              ) : `Matricular (${selectedStudentIds.length})`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

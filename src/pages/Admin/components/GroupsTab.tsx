import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';
import Modal from '../../../components/Modal';

interface Group {
  id: string;
  name: string;
  cohort: string;
  status: string;
  _count?: {
    groupEnrollments: number;
  };
}

interface GroupsTabProps {
  students: Student[];
  courses: CourseData[];
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors';

export function GroupsTab({ students, courses }: GroupsTabProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [saving, setSaving] = useState(false);

  // Form for creating group
  const [groupForm, setGroupForm] = useState({ name: '', cohort: 'Gen 2026-A' });

  // Form for enrollment
  const [enrollForm, setEnrollForm] = useState({ courseId: '', studentIds: [] as string[] });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAllGroups();
      if (res.success) setGroups(res.data || []);
    } catch (e) {
      console.error('Error loading groups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createGroup(groupForm);
      if (res.success) {
        setIsModalOpen(false);
        setGroupForm({ name: '', cohort: 'Gen 2026-A' });
        await loadGroups();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al crear el grupo');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    if (!enrollForm.courseId || enrollForm.studentIds.length === 0) {
      alert('Selecciona un curso y al menos un estudiante');
      return;
    }

    setSaving(true);
    try {
      const res = await api.enrollStudents(selectedGroup.id, {
        userIds: enrollForm.studentIds,
      });
      if (res.success) {
        setIsEnrollModalOpen(false);
        setEnrollForm({ courseId: '', studentIds: [] });
        await loadGroups();
        alert('Estudiantes matriculados con éxito');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al matricular estudiantes');
    } finally {
      setSaving(false);
    }
  };

  const toggleStudentSelection = (id: string) => {
    setEnrollForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter(sid => sid !== id)
        : [...prev.studentIds, id]
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Gestión de Paralelos / Cohortes</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">Organiza a tus estudiantes en grupos de trabajo</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className={BTN_PRIMARY}>
          + Nuevo Paralelo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl">
          <p className="text-slate-400">No hay paralelos registrados.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-red-400 text-sm font-bold hover:underline">
            Crear el primer paralelo ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 text-xl font-black">
                  {group.name.charAt(0)}
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-widest ${group.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {group.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors uppercase">{group.name}</h3>
              <p className="text-xs text-slate-500 font-mono mb-4">{group.cohort}</p>
              
              <div className="bg-slate-900/50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Estudiantes:</span>
                  <span className="text-white font-bold">{group._count?.groupEnrollments || 0}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedGroup(group);
                  setIsEnrollModalOpen(true);
                }}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Asignar Estudiantes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Group */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Paralelo">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Paralelo *</label>
            <input required className={INPUT_CLS} value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Paralelo A" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Generación / Cohorte</label>
            <input required className={INPUT_CLS} value={groupForm.cohort} onChange={e => setGroupForm(f => ({ ...f, cohort: e.target.value }))} placeholder="Ej: Gen 2026-A" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className={`flex-1 py-3 ${BTN_PRIMARY} uppercase tracking-widest text-xs font-black shadow-xl shadow-red-900/20`}>
              {saving ? 'Guardando...' : 'Crear Paralelo'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className={`${BTN_GHOST} uppercase tracking-widest text-xs font-black`}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Modal for Enrolling Students */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Matricular en ${selectedGroup?.name}`}>
        <form onSubmit={handleEnroll} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Paso 1: Seleccionar Curso</label>
            <select required className={INPUT_CLS} value={enrollForm.courseId} onChange={e => setEnrollForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">-- Elige un curso --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Paso 2: Seleccionar Estudiantes ({enrollForm.studentIds.length})</label>
            <div className="max-h-60 overflow-y-auto bg-slate-800 rounded-xl p-2 space-y-1 custom-scrollbar border border-slate-700">
              {students.length === 0 ? (
                <p className="text-center py-4 text-slate-500 text-xs italic">No hay estudiantes disponibles</p>
              ) : (
                students.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStudentSelection(s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      enrollForm.studentIds.includes(s.id) 
                        ? 'bg-red-500/20 text-white border border-red-500/50' 
                        : 'text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${enrollForm.studentIds.includes(s.id) ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                        {s.fullName.charAt(0)}
                      </div>
                      <span className="font-medium">{s.fullName}</span>
                    </div>
                    {enrollForm.studentIds.includes(s.id) && (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || enrollForm.studentIds.length === 0} className={`flex-1 py-3 ${BTN_PRIMARY} uppercase tracking-widest text-xs font-black disabled:opacity-50`}>
              {saving ? 'Procesando...' : `Matricular ${enrollForm.studentIds.length} estudiantes`}
            </button>
            <button type="button" onClick={() => setIsEnrollModalOpen(false)} className={`${BTN_GHOST} uppercase tracking-widest text-xs font-black`}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

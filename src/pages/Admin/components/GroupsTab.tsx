import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { Student, CourseData } from '../types';
import Modal from '../../../components/Modal';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { Group } from '../../../types/group';

interface GroupsTabProps {
  students: Student[];
  courses: CourseData[];
  onSelectGroup?: (group: Group) => void;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors';

export function GroupsTab({ students, courses, onSelectGroup }: GroupsTabProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  // Form for creating group
  const [groupForm, setGroupForm] = useState({ name: '', courseIds: [] as string[] });

  // Form for enrollment
  const [enrollForm, setEnrollForm] = useState({ courseId: '', studentIds: [] as string[] });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGroups();
      if (res.success) {
        setGroups(Array.isArray(res.data) ? res.data : (res.data?.rows || []));
      }
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
      await api.createGroup(groupForm);
      setIsModalOpen(false);
      setGroupForm({ name: '', courseIds: [] });
      await loadGroups();
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Error al crear el grupo');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    if (!enrollForm.courseId || enrollForm.studentIds.length === 0) {
      showAlert('Selecciona un curso y al menos un estudiante');
      return;
    }

    setSaving(true);
    try {
      await api.enrollStudentsInGroup(selectedGroup.id, {
        userIds: enrollForm.studentIds,
      });
      setIsEnrollModalOpen(false);
      setEnrollForm({ courseId: '', studentIds: [] });
      await loadGroups();
      showAlert('Estudiantes matriculados con éxito', 'Éxito');
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Error al matricular estudiantes');
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
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Gestión de Grupos / Cohortes</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">Organiza a tus estudiantes en grupos de trabajo</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className={BTN_PRIMARY}>
          + Nuevo Grupo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl">
          <p className="text-slate-400">No hay grupos registrados.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-red-400 text-sm font-bold hover:underline">
            Crear el primer grupo ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => onSelectGroup && onSelectGroup(group)}
              className={`bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all group relative ${onSelectGroup ? 'cursor-pointer' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-widest ${group.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {group.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors uppercase">{group.name}</h3>
              <p className="text-xs text-slate-500 font-mono mb-4">{group.startDate} - {group.endDate || 'Presente'}</p>
              
              <div className="bg-slate-900/50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Cursos:</span>
                  <span className="text-white font-bold">{group.courseCount}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGroup(group);
                  setIsEnrollModalOpen(true);
                }}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Inscribir Estudiantes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Group */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Grupo">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Grupo *</label>
            <input required className={INPUT_CLS} value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Grupo A" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cursos Disponibles</label>
            <div className="max-h-48 overflow-y-auto bg-slate-700 border border-slate-600 rounded-lg p-2 space-y-1 custom-scrollbar">
              {courses.length === 0 ? (
                <p className="text-center py-3 text-slate-500 text-xs italic">No hay cursos disponibles</p>
              ) : (
                courses.map(c => (
                  <label key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={groupForm.courseIds.includes(c.id)}
                      onChange={() => setGroupForm(f => ({
                        ...f,
                        courseIds: f.courseIds.includes(c.id)
                          ? f.courseIds.filter(id => id !== c.id)
                          : [...f.courseIds, c.id]
                      }))}
                      className="accent-red-500 w-4 h-4"
                    />
                    <span className="text-sm text-white">{c.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className={`flex-1 py-3 ${BTN_PRIMARY} uppercase tracking-widest text-xs font-black shadow-xl shadow-red-900/20`}>
              {saving ? 'Guardando...' : 'Crear Grupo'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className={`${BTN_GHOST} uppercase tracking-widest text-xs font-black`}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Modal for Enrolling Students */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Inscribir en ${selectedGroup?.name}`}>
        <form onSubmit={handleEnroll} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seleccionar Curso</label>
            <select required className={INPUT_CLS} value={enrollForm.courseId} onChange={e => setEnrollForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">-- Elige un curso --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Seleccionar Estudiantes ({enrollForm.studentIds.length})</label>
              <button 
                type="button"
                onClick={() => {
                  const allIds = students.map(s => s.id);
                  const allSelected = allIds.every(id => enrollForm.studentIds.includes(id));
                  setEnrollForm(prev => ({
                    ...prev,
                    studentIds: allSelected ? [] : allIds
                  }));
                }}
                className="text-[10px] font-black text-red-500 uppercase hover:underline"
              >
                {students.map(s => s.id).every(id => enrollForm.studentIds.includes(id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
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
              {saving ? 'Procesando...' : `Inscribir ${enrollForm.studentIds.length} estudiantes`}
            </button>
            <button type="button" onClick={() => setIsEnrollModalOpen(false)} className={`${BTN_GHOST} uppercase tracking-widest text-xs font-black`}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}

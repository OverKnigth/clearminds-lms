import { useState } from 'react';
import type { Group, UpdateGroupPayload } from '../../../types/generation';
import Modal from '../../../components/Modal';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
  onUpdate: (id: string, data: UpdateGroupPayload) => Promise<Group>;
  onDelete: (id: string) => void;
}

const INPUT_CLS =
  'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY =
  'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';
const BTN_GHOST =
  'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-colors';

export function GroupCard({ group, onClick, onUpdate, onDelete }: GroupCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<UpdateGroupPayload>({
    name: group.name,
    description: group.description ?? '',
    status: group.status,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const statusColor =
    group.status === 'active'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-slate-700 text-slate-400';

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({
      name: group.name,
      description: group.description ?? '',
      status: group.status,
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    setSaving(true);
    try {
      await onUpdate(group.id, {
        name: form.name?.trim(),
        description: form.description?.trim() || undefined,
        status: form.status,
      });
      setIsEditOpen(false);
    } catch (err: any) {
      const status = err?.status;
      if (status === 409) {
        setFormError('Ya existe un grupo con ese nombre.');
      } else if (status === 400) {
        setFormError(err?.message ?? 'Datos inválidos. Revisa los campos.');
      } else {
        setFormError('Error al actualizar el grupo. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-black text-white uppercase tracking-tighter group-hover:text-red-400 transition-colors truncate pr-2">
            {group.name}
          </h3>
          <span
            className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-widest shrink-0 ${statusColor}`}
          >
            {group.status === 'active' ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">{group.description}</p>
        )}

        <div className="space-y-1.5 pt-3 border-t border-slate-700/50 text-[10px] font-black uppercase tracking-widest">
          <div className="flex justify-between">
            <span className="text-slate-500">Cursos:</span>
            <span className="text-white">{group.courseCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex gap-2">
          <button
            onClick={openEdit}
            className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
            className="px-3 py-1.5 bg-red-900/10 hover:bg-red-900/30 text-[10px] font-black uppercase tracking-widest text-red-500 rounded-lg transition-colors border border-red-900/20"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Grupo"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Nombre *
            </label>
            <input
              required
              className={INPUT_CLS}
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Grupo 2026-A"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              className={INPUT_CLS + ' resize-none'}
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descripción opcional del grupo"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Estado
            </label>
            <select
              className={INPUT_CLS}
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
              }
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>

          {/* Inline error */}
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-bold">{formError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={
                BTN_PRIMARY +
                ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'
              }
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Modal from '../../../components/Modal';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  category: string;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg transition-all flex items-center gap-2';

export function BadgesTab() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'academic',
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBadges();
      if (res.success) setBadges(res.data);
    } catch (e) {
      console.error('Error loading badges:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (badge?: Badge) => {
    if (badge) {
      setForm({
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon || '🏆',
        category: badge.category,
      });
      setEditingBadge(badge);
    } else {
      setForm({
        name: '',
        description: '',
        icon: '🏆',
        category: 'academic',
      });
      setEditingBadge(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Nota: En un sistema real usaríamos un endpoint específico de CREATE_BADGE
      // Por ahora simularemos la persistencia o usaremos un endpoint genérico de admin si existiera
      alert('Implementando guardado de insignia: ' + form.name);
      setIsModalOpen(false);
      loadBadges();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Catálogo de Insignias</h2>
          <p className="text-sm text-slate-400">Reconocimientos visuales para los estudiantes</p>
        </div>
        <button onClick={() => handleOpenModal()} className={BTN_PRIMARY}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Insignia
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map(badge => (
            <div key={badge.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center group hover:border-red-500/50 transition-all">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                {badge.icon || '🏆'}
              </div>
              <h3 className="text-white font-bold mb-1">{badge.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{badge.description || 'Sin descripción'}</p>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(badge)} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la insignia *</label>
            <input required className={INPUT_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: JS Fundamentals Pro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Icono / Emoji *</label>
            <div className="flex gap-2 flex-wrap">
              {['🏆', '🥇', '🚀', '💻', '⭐', '🔥', '🎓', '⚡'].map(icon => (
                <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))} 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border transition-all ${form.icon === icon ? 'border-red-500 bg-red-500/20' : 'border-slate-600 bg-slate-700 hover:border-slate-500'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
            <textarea rows={3} className={INPUT_CLS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Escribe qué representa esta insignia..." />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className={`flex-1 py-2.5 ${BTN_PRIMARY} justify-center disabled:opacity-50`}>
              {saving ? 'Guardando...' : editingBadge ? 'Guardar cambios' : 'Crear insignia'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '@/shared/services/api';
import { useDialog } from '@/shared/hooks/useDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { Student } from '../../../domain/entities';

interface TutorsTabProps {
  tutors: Student[];
  openModal: (type: 'addTutor' | 'editStudent' | 'resetPassword', student?: Student) => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (tutor: Student) => void;
  onDelete?: (tutor: Student) => void;
}

export function TutorsTab({ tutors, openModal, currentPage, totalItems, itemsPerPage, onPageChange, onToggleStatus, onDelete }: TutorsTabProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [subTab, setSubTab] = useState<'list' | 'rules'>('list');
  const { dialog, showAlert, close: closeDialog } = useDialog();

  // ── Global message ────────────────────────────────────────────────────────
  const [globalMessage, setGlobalMessage] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSaving, setMsgSaving] = useState(false);
  const [msgSaved, setMsgSaved] = useState(false);
  const [msgEditing, setMsgEditing] = useState(false);

  useEffect(() => {
    if (subTab === 'rules' && !msgLoading && globalMessage === '') loadMessage();
  }, [subTab]);

  const loadMessage = async () => {
    setMsgLoading(true);
    try {
      const res = await api.getTutoringConfig();
      if (res.success) setGlobalMessage(res.data.globalMessage || '');
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }
  };

  const handleSaveMessage = async () => {
    setMsgSaving(true);
    try {
      await api.updateTutoringConfig(globalMessage);
      setMsgSaved(true);
      setMsgEditing(false);
      setTimeout(() => setMsgSaved(false), 2500);
    } catch (e: any) { showAlert(e.response?.data?.message || 'Error al guardar'); }
    finally { setMsgSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de Tutores</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Administra tutores y mensajes de tutoría</p>
        </div>
        {subTab === 'list' && (
          <button onClick={() => openModal('addTutor')}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Tutor
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit border border-slate-700 mb-6">
        <button onClick={() => setSubTab('list')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'list' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          Tutores
        </button>
        <button onClick={() => setSubTab('rules')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'rules' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
         Reglas de Tutoría
        </button>
      </div>

      {/* ── TUTORS LIST ── */}
      {subTab === 'list' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutor</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-xs font-black">
                        {tutor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{tutor.fullName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{tutor.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-black text-xs">{(tutor as any).rating > 0 ? (tutor as any).rating.toFixed(1) : '-'}</span>
                      <span className="text-slate-500 text-[10px]">({(tutor as any).reviewsCount || 0})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onToggleStatus(tutor)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                        tutor.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}>
                      {tutor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal('editStudent', tutor)} title="Editar"
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => openModal('resetPassword', tutor)} title="Restablecer contraseña"
                        className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      {onDelete && (
                        <button onClick={() => onDelete(tutor)} title="Eliminar"
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
              {tutors.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">No hay tutores registrados</td></tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mostrando {tutors.length} de {totalItems}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>← Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)).map(page => (
                  <button key={page} onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}>{page}</button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Siguiente →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES ── */}
      {subTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tighter mb-1">Reglas Globales para Tutores</p>
                <p className="text-xs text-slate-500">Este texto aparecerá como aviso en el panel de todos los tutores.</p>
              </div>
              {!msgEditing && globalMessage && (
                <button onClick={() => setMsgEditing(true)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all border border-slate-600">
                  Editar
                </button>
              )}
            </div>

            {msgLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : msgEditing || !globalMessage ? (
              <>
                <textarea
                  rows={6}
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  placeholder="Ej: Recuerden registrar el link de grabación al finalizar cada sesión. Las tutorías deben completarse dentro de las 48h de ser solicitadas..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-500"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">{globalMessage.length} caracteres</p>
                  <div className="flex gap-2">
                    {msgEditing && (
                      <button onClick={() => { setMsgEditing(false); loadMessage(); }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all">
                        Cancelar
                      </button>
                    )}
                    <button onClick={handleSaveMessage} disabled={msgSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                      {msgSaving ? 'Guardando...' : msgSaved ? '✓ Publicado' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Published view */
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Aviso del Administrador — Publicado</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{globalMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        danger={dialog.danger}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}


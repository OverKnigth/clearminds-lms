import type { Student } from '../types';

interface AdminsTabProps {
  admins: Student[];
  openModal: (type: 'addStudent' | 'editStudent' | 'resetPassword', student?: Student) => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (admin: Student) => void;
}

export function AdminsTab({ admins, openModal, currentPage, totalItems, itemsPerPage, onPageChange, onToggleStatus }: AdminsTabProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Gestión de Administradores</h2>
          <p className="text-sm text-slate-400">Administra perfiles de alto nivel</p>
        </div>
        <button
          onClick={() => openModal('addStudent')}
          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Administrador
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Administrador</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold">
                      {admin.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{admin.fullName}</p>
                      <p className="text-xs text-slate-400">ID: {admin.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">{admin.email}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(admin)}
                    className={`px-2 py-1 text-xs font-semibold rounded transition-all hover:opacity-80 cursor-pointer ${
                      admin.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                    title={`Click para ${admin.status === 'active' ? 'desactivar' : 'activar'}`}
                  >
                    {admin.status === 'active' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal('editStudent', admin)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => openModal('resetPassword', admin)}
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
              Mostrando {admins.length} de {totalItems} administradores
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

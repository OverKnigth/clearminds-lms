interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel: string; // e.g., "estudiantes", "tutores", "administradores"
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItemsCount = Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
      <div className="text-sm text-slate-400">
        Mostrando {currentItemsCount} de {totalItems} {itemLabel}
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
            // Show first page, last page, current page, and pages around current
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
  );
}

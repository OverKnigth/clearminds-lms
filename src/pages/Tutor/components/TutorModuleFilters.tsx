interface TutorModuleFiltersProps {
  filters: {
    name: string;
    email: string;
    course: string;
  };
  courseOptions: string[];
  onChange: (next: { name: string; email: string; course: string }) => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40';

export function TutorModuleFilters({ filters, courseOptions, onChange }: TutorModuleFiltersProps) {
  const hasFilters = Boolean(filters.name || filters.email || filters.course);

  return (
    <div className="space-y-3 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={filters.name}
          onChange={(e) => onChange({ ...filters, name: e.target.value })}
          placeholder="Nombre"
          className={INPUT_CLASS}
        />
        <input
          value={filters.email}
          onChange={(e) => onChange({ ...filters, email: e.target.value })}
          placeholder="Correo"
          className={INPUT_CLASS}
        />
        <select
          value={filters.course}
          onChange={(e) => onChange({ ...filters, course: e.target.value })}
          className={INPUT_CLASS}
        >
          <option value="">Todos los cursos</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onChange({ name: '', email: '', course: '' })}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

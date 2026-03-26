export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center text-slate-400 text-sm">
          <span>© {new Date().getFullYear()} Elaborado por <span className="font-semibold text-red-500">Krakedev</span></span>
        </div>
      </div>
    </footer>
  );
}

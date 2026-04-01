export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800/50 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center">
          <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Elaborado por <span className="text-red-700">Krakedev</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

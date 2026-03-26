export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

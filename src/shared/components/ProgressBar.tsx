interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({ progress, showLabel = true, size = 'md' }: ProgressBarProps) {
  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
          <span>Progreso</span>
          <span className="font-medium">{progress}%</span>
        </div>
      )}
      <div className={`${heights[size]} bg-slate-700 rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

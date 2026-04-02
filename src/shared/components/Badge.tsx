interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
  const variants = {
    primary: 'bg-red-500/20 text-red-400',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    info: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}

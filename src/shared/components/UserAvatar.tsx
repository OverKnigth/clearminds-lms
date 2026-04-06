interface UserAvatarProps {
  name: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ name, size = 'md', className = '' }: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const roundedClasses = {
    xs: 'rounded-lg',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-[20px]'
  };

  return (
    <div className={`
      relative flex items-center justify-center flex-shrink-0
      ${sizeClasses[size]} 
      ${roundedClasses[size]}
      bg-gradient-to-br from-red-500 via-red-600 to-red-800
      border border-white/10
      shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)]
      group-hover:shadow-[0_12px_20px_-8px_rgba(220,38,38,0.6)]
      transition-all duration-500 ease-out
      overflow-hidden
      ${className}
    `}>
      {/* Glossy Refraction Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-50" />
      
      {/* Inner Rim Light */}
      <div className="absolute inset-[1px] rounded-[inherit] border border-white/5 pointer-events-none" />
      
      {/* Texture/Noise Overlay (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* The Initial */}
      <span className="
        relative font-black text-white uppercase tracking-tighter 
        drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] 
        group-hover:scale-110 transition-transform duration-500
        z-10
      ">
        {initial}
      </span>

      {/* Decorative Glow Spot */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 blur-2xl rounded-full" />
    </div>
  );
}

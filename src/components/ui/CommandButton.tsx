import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

export const CommandButton: React.FC<Props> = ({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-[#38BDF8] hover:bg-[#0284C7] active:bg-[#0369A1] text-slate-950 font-bold border border-transparent shadow-sm',
    secondary: 'bg-[#0A1422] hover:bg-[#0D1726] active:bg-[#07111D] text-slate-200 border border-[#1E293B] hover:border-[#38BDF8]/50 font-medium shadow-sm',
    tertiary: 'bg-transparent hover:bg-[#0A1422] text-slate-400 hover:text-slate-100 font-medium border border-transparent',
    danger: 'bg-rose-950/80 hover:bg-rose-900 active:bg-rose-950 text-rose-200 border border-rose-500/40 font-medium shadow-sm',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md font-mono transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      {children}
    </button>
  );
};

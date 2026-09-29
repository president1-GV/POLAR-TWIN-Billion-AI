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
    primary: 'bg-polar-cyan hover:brightness-105 active:brightness-95 text-white dark:text-slate-950 font-bold border border-transparent shadow-sm',
    secondary: 'bg-polar-elevated hover:bg-polar-hover text-polar-text-primary border border-polar-border hover:border-polar-border-active font-medium shadow-sm',
    tertiary: 'bg-transparent hover:bg-polar-elevated text-polar-text-muted hover:text-polar-text-primary font-medium border border-transparent',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-medium shadow-sm',
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

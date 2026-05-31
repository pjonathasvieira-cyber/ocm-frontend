import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    disabled,
    children,
    className,
    ...props 
  }, ref) => {
    const baseClasses = 'font-semibold rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[#C9A050] text-black hover:opacity-90 active:opacity-80',
      secondary: 'border border-[#C9A050] text-[#C9A050] hover:bg-[#C9A050] hover:text-black active:opacity-80 disabled:border-[#555555] disabled:text-[#555555]'
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className || ''}`}
        {...props}
      >
        {loading ? <span className="opacity-60">Carregando...</span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

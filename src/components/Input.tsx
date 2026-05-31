import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText,
    fullWidth = true,
    className,
    ...props 
  }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-[#F0F0F0] text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${fullWidth ? 'w-full' : ''} ${error ? 'border-[#FF6B6B]' : ''} ${className || ''}`}
          {...props}
        />
        {error && (
          <p className="text-[#FF6B6B] text-xs mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[#888888] text-xs mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

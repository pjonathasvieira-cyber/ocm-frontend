import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    helperText,
    className,
    ...props 
  }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={`checkbox-custom mt-1 ${className || ''}`}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label className="block text-[#F0F0F0] text-sm font-medium cursor-pointer">
              {label}
            </label>
          )}
          {helperText && (
            <p className="text-[#888888] text-xs mt-1">{helperText}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

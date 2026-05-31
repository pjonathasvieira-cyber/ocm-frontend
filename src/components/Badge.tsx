import React from 'react';

interface BadgeProps {
  variant?: 'pilar' | 'status';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'pilar', 
  children,
  className = ''
}) => {
  const variantClasses = {
    pilar: 'inline-block px-3 py-1 border border-[#C9A050] text-[#C9A050] text-xs font-semibold uppercase rounded-sm tracking-widest',
    status: 'inline-block px-2 py-1 rounded-sm text-xs font-medium'
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

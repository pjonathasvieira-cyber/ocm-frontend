import React from 'react';

export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border-t border-[#2A2A2A] ${className}`} />
);

interface ProgressBarProps {
  percentage: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  label,
  className = ''
}) => (
  <div className={className}>
    {label && (
      <p className="text-[#888888] text-xs mb-2">{label}</p>
    )}
    <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#C9A050] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  </div>
);

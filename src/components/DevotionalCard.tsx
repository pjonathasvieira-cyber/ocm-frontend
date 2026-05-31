import React from 'react';

interface DevotionalCardProps {
  anchorText: string;
  anchorReference: string;
  reflection: string;
  question: string;
  expanded?: boolean;
}

export const DevotionalCard: React.FC<DevotionalCardProps> = ({
  anchorText,
  anchorReference,
  reflection,
  question,
  expanded = true
}) => {
  return (
    <div className="bg-[#1A1A1A] p-6 rounded-sm border-l-[3px] border-l-[#C9A050]">
      {/* Label + Line */}
      <p className="text-[#C9A050] text-xs uppercase tracking-widest font-semibold mb-2">
        Âncora
      </p>
      <div className="w-10 h-px bg-[#C9A050] mb-4" />

      {/* Anchor Text (Scripture) */}
      <p className="text-[#C9A050] italic text-base mb-4 leading-relaxed">
        "{anchorText}"
        {anchorReference && <span className="text-[#888888] font-normal"> ({anchorReference})</span>}
      </p>

      {/* Reflection */}
      <p className="text-[#F0F0F0] text-sm leading-7 mb-6">
        {reflection}
      </p>

      {/* Question of the Day */}
      <div className="bg-[#0D0D0D] border-l-[3px] border-l-[#C9A050] p-4">
        <p className="text-[#C9A050] text-xs uppercase tracking-widest font-semibold mb-2">
          Pergunta do dia
        </p>
        <p className="text-[#F0F0F0] text-sm leading-6">
          {question}
        </p>
      </div>
    </div>
  );
};

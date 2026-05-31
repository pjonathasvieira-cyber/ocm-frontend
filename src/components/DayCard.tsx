import React from 'react';
import { Day } from '../lib/api';
import { getDayNameBR, getDayTypeLabel } from '../lib/utils';

interface DayCardProps {
  day: Day;
  isUnlocked: boolean;
  onClick?: () => void;
  unlockDate?: string; // data em que este dia será liberado
}

const DayCard = React.forwardRef<HTMLDivElement, DayCardProps>(
  ({ day, isUnlocked, onClick, unlockDate }, ref) => {
    const opacity = isUnlocked ? 'opacity-100' : 'opacity-50';
    const cursor = isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed';
    const hoverEffect = isUnlocked ? 'hover:bg-bg-elevated transition-colors' : '';

    return (
      <div
        ref={ref}
        onClick={isUnlocked ? onClick : undefined}
        className={`bg-bg-card border-l-2 border-accent p-4 rounded text-center ${opacity} ${cursor} ${hoverEffect}`}
      >
        <div className="text-accent text-xs font-bold uppercase tracking-wider mb-2">
          Dia {day.day_number}
        </div>

        <h4 className="text-sm font-semibold text-text-primary mb-2">{getDayNameBR(day.day_number)}</h4>

        <p className="text-xs text-text-secondary mb-3">{getDayTypeLabel(day.day_type)}</p>

        {!isUnlocked && (
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 text-accent mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {unlockDate && <span className="text-xs text-text-secondary">{unlockDate}</span>}
          </div>
        )}
      </div>
    );
  }
);

DayCard.displayName = 'DayCard';

export { DayCard };

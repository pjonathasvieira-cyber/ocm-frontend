import React from 'react';
import { Week } from '../lib/api';
import { Badge } from './Badge';

interface WeekCardProps {
  week: Week;
  isUnlocked: boolean;
  daysRemaining?: number;
  onClick?: () => void;
}

const WeekCard = React.forwardRef<HTMLDivElement, WeekCardProps>(
  ({ week, isUnlocked, daysRemaining, onClick }, ref) => {
    const opacity = isUnlocked ? 'opacity-100' : 'opacity-50';
    const cursor = isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed';
    const hoverEffect = isUnlocked ? 'hover:bg-bg-elevated transition-colors' : '';

    return (
      <div
        ref={ref}
        onClick={isUnlocked ? onClick : undefined}
        className={`bg-bg-card border-l-3 border-accent p-6 rounded ${opacity} ${cursor} ${hoverEffect}`}
      >
        <div className="flex items-start justify-between mb-3">
          <Badge>{week.pillar}</Badge>
          {!isUnlocked && (
            <div className="flex items-center gap-2 text-accent text-sm">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              {daysRemaining === 0 ? 'Hoje' : `${daysRemaining}d`}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-text-primary mb-2">{week.title}</h3>

        <div className="w-10 h-px bg-accent mb-3" />

        <p className="text-text-secondary text-sm">{week.focus}</p>

        {!isUnlocked && (
          <div className="mt-4 text-accent text-sm font-medium">
            Disponível em {daysRemaining === 1 ? '1 dia' : `${daysRemaining} dias`}
          </div>
        )}
      </div>
    );
  }
);

WeekCard.displayName = 'WeekCard';

export { WeekCard };

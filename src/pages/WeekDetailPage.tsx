import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { DayCard } from '../components/DayCard';
import { getDaysForWeek, getWeekByNumber, getCurrentWeekNumber } from '../lib/api';
import { getCurrentUserProfile } from '../lib/auth';
import type { Week, Day } from '../lib/api';

function isDayUnlocked(weekNumber: number, dayNumber: number, startDate: string): boolean {
  if (!startDate) return false;
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const requiredDays = (weekNumber - 1) * 7 + (dayNumber - 1);
  return daysSinceStart >= requiredDays;
}

export function WeekDetailPage() {
  const navigate = useNavigate();
  const { weekId } = useParams<{ weekId: string }>();
  const [week, setWeek] = useState<Week | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [startDate, setStartDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!weekId) {
          setError('Week ID not provided');
          setLoading(false);
          return;
        }

        // Get user profile for week calculation
        const profileRes = await getCurrentUserProfile();
        if (profileRes.error || !profileRes.data) {
          setError(profileRes.error || 'Could not fetch profile');
          setLoading(false);
          return;
        }

        // Get current week number
        const weekNumRes = await getCurrentWeekNumber(profileRes.data.start_date ?? '');
        if (weekNumRes.error || weekNumRes.data === null) {
          setError('Could not calculate week');
          setLoading(false);
          return;
        }

        setCurrentWeekNumber(weekNumRes.data);
        setStartDate(profileRes.data.start_date ?? '');

        // Parse weekId to number
        const weekNumber = parseInt(weekId, 10);

        // Get week details
        const weekRes = await getWeekByNumber(weekNumber);
        if (weekRes.error || !weekRes.data) {
          setError(weekRes.error || 'Week not found');
          setLoading(false);
          return;
        }

        setWeek(weekRes.data);

        // Get days for this week
        const daysRes = await getDaysForWeek(weekRes.data.id);
        if (daysRes.error) {
          setError(daysRes.error);
          setLoading(false);
          return;
        }

        setDays(daysRes.data || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, [weekId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error || !week) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">{error || 'Week not found'}</div>
      </div>
    );
  }

  const isUnlocked = week.number <= currentWeekNumber;
  const prevWeek = week.number > 1 ? week.number - 1 : null;
  const nextWeek = week.number < 12 ? week.number + 1 : null;

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-accent hover:text-accent-muted transition-colors"
          >
            ← Voltar
          </button>
        </div>

        <div className="uppercase text-accent text-xs font-bold tracking-wider mb-2">
          {week.pillar}
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{week.title}</h1>
        <p className="text-text-secondary text-sm">{week.focus}</p>
      </header>

      {/* Days Grid */}
      <main className="px-4 sm:px-6 py-8">
        {!isUnlocked ? (
          <div className="bg-bg-card border border-border rounded p-8 text-center">
            <svg className="w-12 h-12 text-accent mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-text-secondary mb-2">Esta semana ainda não está desbloqueada</p>
            <Button variant="secondary" size="md" onClick={() => navigate('/weeks')}>
              Ver outras semanas
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">7 Dias</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {days.map((day) => {
                const unlocked = isDayUnlocked(week.number, day.day_number, startDate);
                // Calcular data de liberação para dias bloqueados
                let unlockDateStr: string | undefined;
                if (!unlocked && startDate) {
                  const start = new Date(startDate);
                  const daysUntil = (week.number - 1) * 7 + (day.day_number - 1);
                  start.setDate(start.getDate() + daysUntil);
                  unlockDateStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                }
                return (
                  <DayCard
                    key={day.id}
                    day={day}
                    isUnlocked={unlocked}
                    unlockDate={unlockDateStr}
                    onClick={() => unlocked && navigate(`/day/${day.id}`)}
                  />
                );
              })}
            </div>

            {/* Week Info */}
            <div className="bg-bg-card border border-border rounded p-6 mb-8">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Objetivo da Semana</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{week.objective}</p>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-8">
          <Button
            variant="secondary"
            size="md"
            disabled={!prevWeek}
            onClick={() => prevWeek && navigate(`/week/${prevWeek}`)}
          >
            ← Semana Anterior
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={!nextWeek}
            onClick={() => nextWeek && navigate(`/week/${nextWeek}`)}
          >
            Próxima Semana →
          </Button>
        </div>
      </main>
    </div>
  );
}

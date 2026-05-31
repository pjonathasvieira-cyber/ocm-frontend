import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WeekCard } from '../components/WeekCard';
import { Button } from '../components/Button';
import { getCurrentUserProfile, getCurrentWeekNumber } from '../lib/auth';
import { getWeeks } from '../lib/api';
import type { Week } from '../lib/api';
import { daysUntilWeekUnlock } from '../lib/utils';

export function WeeksPage() {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [filteredWeeks, setFilteredWeeks] = useState<Week[]>([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [userStartDate, setUserStartDate] = useState<string | null>(null);

  const pillars = ['DOMÍNIO', 'CULTIVAR', 'GUARDAR', 'LIDERAR'];

  useEffect(() => {
    async function loadData() {
      try {
        // Get user profile for start date
        const { data: profile, error: profileErr } = await getCurrentUserProfile();
        if (profileErr || !profile) {
          setError(profileErr || 'Could not fetch profile');
          setLoading(false);
          return;
        }

        setUserStartDate(profile.start_date);

        // Get current week number
        const { data: weekNum, error: weekErr } = await getCurrentWeekNumber(profile.start_date ?? '');
        if (weekErr || weekNum === null) {
          setError(weekErr || 'Could not calculate week');
          setLoading(false);
          return;
        }

        setCurrentWeekNumber(weekNum);

        // Get all weeks
        const { data: allWeeks, error: weeksErr } = await getWeeks();
        if (weeksErr || !allWeeks) {
          setError(weeksErr || 'Could not fetch weeks');
          setLoading(false);
          return;
        }

        setWeeks(allWeeks);
        setFilteredWeeks(allWeeks);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter weeks by pillar
  useEffect(() => {
    if (selectedPillar === 'ALL') {
      setFilteredWeeks(weeks);
    } else {
      setFilteredWeeks(weeks.filter((w) => w.pillar === selectedPillar));
    }
  }, [selectedPillar, weeks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">{error}</div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text-primary">Todas as Semanas</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Filter Tabs */}
      <nav className="bg-bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedPillar('ALL')}
            className={`px-4 py-2 rounded text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedPillar === 'ALL'
                ? 'bg-accent text-black'
                : 'bg-bg-elevated text-text-primary hover:bg-border'
            }`}
          >
            Tudo
          </button>
          {pillars.map((pillar) => (
            <button
              key={pillar}
              onClick={() => setSelectedPillar(pillar)}
              className={`px-4 py-2 rounded text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedPillar === pillar
                  ? 'bg-accent text-black'
                  : 'bg-bg-elevated text-text-primary hover:bg-border'
              }`}
            >
              {pillar}
            </button>
          ))}
        </div>
      </nav>

      {/* Weeks Grid */}
      <main className="px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {filteredWeeks.map((week) => {
            const isUnlocked = week.number <= currentWeekNumber;
            const daysRemaining = isUnlocked ? 0 : daysUntilWeekUnlock(week.number, userStartDate || '');

            return (
              <WeekCard
                key={week.id}
                week={week}
                isUnlocked={isUnlocked}
                daysRemaining={daysRemaining}
                onClick={() => {
                  if (isUnlocked) {
                    navigate(`/week/${week.id}`);
                  }
                }}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { WeekCard } from '../components/WeekCard';
import { Divider } from '../components/Divider';
import { getCurrentUserProfile, getCurrentWeekNumber } from '../lib/auth';
import { getWeekByNumber, getDaysForWeek } from '../lib/api';
import type { Week, Day } from '../lib/api';
import { daysRemainingUntilExpiration } from '../lib/utils';

export function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        // Get user profile
        const profileRes = await getCurrentUserProfile();
        if (profileRes.error || !profileRes.data) {
          setError(profileRes.error || 'Could not fetch profile');
          setLoading(false);
          return;
        }

        setUserProfile(profileRes.data);

        // Get current week number
        const weekRes = await getCurrentWeekNumber(profileRes.data.start_date ?? '');
        if (weekRes.error || weekRes.data === null) {
          setError('Could not calculate current week');
          setLoading(false);
          return;
        }

        setCurrentWeekNumber(weekRes.data);

        // Get current week details
        const weekDataRes = await getWeekByNumber(weekRes.data);
        if (weekDataRes.error || !weekDataRes.data) {
          setError('Could not fetch current week details');
          setLoading(false);
          return;
        }

        setCurrentWeek(weekDataRes.data);

        // Get days for current week
        const daysRes = await getDaysForWeek(weekDataRes.data.id);
        if (daysRes.error) {
          setError('Could not fetch days');
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
  }, []);

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

  const daysUntilExpiry = daysRemainingUntilExpiration(userProfile?.access_expires_at);

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Bem-vindo, <span className="text-accent">{userProfile?.name || 'Estudante'}</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {daysUntilExpiry} dias restantes
        </p>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        {/* Current Week Card */}
        {currentWeek && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
              Semana Atual
            </h2>

            <div className="bg-bg-card border-l-3 border-accent p-6 rounded mb-6">
              <div className="uppercase text-accent text-xs font-bold tracking-wider mb-2">
                {currentWeek.pillar}
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-3">{currentWeek.title}</h3>

              <div className="w-10 h-px bg-accent mb-4" />

              <p className="text-text-secondary text-sm mb-4">{currentWeek.focus}</p>

              <div className="bg-bg-elevated p-3 rounded mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Progresso da Semana</span>
                  <span className="text-accent text-sm font-semibold">{days.length}/7 dias</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${(days.length / 7) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => days[0] ? navigate(`/day/${days[0].id}`) : navigate('/weeks')}
                >
                  Abrir Devocional
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/weeks')}
                >
                  Ver Todas as Semanas
                </Button>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/week/${currentWeek?.id}/habits`)}
              className="bg-bg-card hover:bg-bg-elevated transition-colors border border-border rounded p-4 text-center"
            >
              <div className="text-2xl mb-2">✓</div>
              <div className="text-sm font-semibold text-text-primary">Hábitos</div>
              <div className="text-xs text-text-secondary">De hoje</div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="bg-bg-card hover:bg-bg-elevated transition-colors border border-border rounded p-4 text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-semibold text-text-primary">Perfil</div>
              <div className="text-xs text-text-secondary">Configurações</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

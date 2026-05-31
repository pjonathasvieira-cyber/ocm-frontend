import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { getCurrentUserProfile } from '../lib/auth';
import { getHabitsForWeek, getHabitLogsForDate, upsertHabitLog } from '../lib/api';
import type { Habit, HabitLog } from '../lib/api';
import { formatDateShort } from '../lib/utils';

export function HabitsPage() {
  const navigate = useNavigate();
  const { weekId } = useParams<{ weekId: string }>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      try {
        if (!weekId) {
          setError('Week ID not provided');
          setLoading(false);
          return;
        }

        const weekIdNum = parseInt(weekId, 10);

        // Get habits for this week
        const habitsRes = await getHabitsForWeek(weekIdNum);
        if (habitsRes.error || !habitsRes.data) {
          setError(habitsRes.error || 'Could not fetch habits');
          setLoading(false);
          return;
        }

        setHabits(habitsRes.data);

        // Get habit logs for today
        const logsRes = await getHabitLogsForDate(logDate);
        if (logsRes.error) {
          setError(logsRes.error);
          setLoading(false);
          return;
        }

        setHabitLogs(logsRes.data || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, [weekId, logDate]);

  const handleHabitToggle = async (habitId: number, currentStatus: boolean) => {
    try {
      const { error } = await upsertHabitLog(habitId, logDate, !currentStatus);
      if (error) {
        setError(error);
        return;
      }

      // Update local state
      const existingLog = habitLogs.find((log) => log.habit_id === habitId);
      if (existingLog) {
        setHabitLogs(
          habitLogs.map((log) =>
            log.habit_id === habitId ? { ...log, completed: !currentStatus } : log
          )
        );
      } else {
        setHabitLogs([
          ...habitLogs,
          {
            id: Math.random(),
            user_id: '',
            habit_id: habitId,
            log_date: logDate,
            completed: !currentStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const completedCount = habitLogs.filter((log) => log.completed).length;

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
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Hábitos Diários</h1>
        <p className="text-text-secondary text-sm">{formatDateShort(logDate)}</p>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="bg-bg-card border border-border rounded p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Progresso de Hoje</span>
            <span className="text-accent text-sm font-semibold">
              {completedCount}/{habits.length}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / habits.length) * 100}%` }}
            />
          </div>

          {completedCount === habits.length && habits.length > 0 && (
            <div className="mt-4 p-3 bg-bg-elevated rounded border border-accent text-center">
              <p className="text-accent text-sm font-semibold">✓ Todos os hábitos completados!</p>
            </div>
          )}
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-bg-card border border-border rounded p-8 text-center">
            <p className="text-text-secondary">Nenhum hábito configurado para esta semana</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const log = habitLogs.find((l) => l.habit_id === habit.id);
              const isCompleted = log?.completed || false;

              return (
                <div
                  key={habit.id}
                  className={`bg-bg-card border border-border rounded p-4 flex items-start gap-4 transition-all ${
                    isCompleted ? 'opacity-75 bg-bg-elevated' : ''
                  }`}
                >
                  <button
                    onClick={() => handleHabitToggle(habit.id, isCompleted)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-colors ${
                      isCompleted
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-10'
                    }`}
                  >
                    {isCompleted && (
                      <svg
                        className="w-4 h-4 text-black"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="flex-grow">
                    <h4
                      className={`font-semibold ${
                        isCompleted ? 'text-text-muted line-through' : 'text-text-primary'
                      }`}
                    >
                      {habit.title}
                    </h4>
                    {habit.description && (
                      <p className="text-text-secondary text-sm mt-1">{habit.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

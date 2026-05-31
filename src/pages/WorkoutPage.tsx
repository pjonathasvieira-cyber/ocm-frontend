import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Program { id: number; name: string; level: string; frequency: string; description: string; order_index: number; }
interface Session { id: number; program_id: number; name: string; order_index: number; }
interface Exercise { id: number; session_id: number; name: string; sets: string; reps: string; rest: string; notes: string | null; order_index: number; }
interface WorkoutLog { exercise_id: number; weight_kg: number | null; reps_done: number | null; notes: string | null; }

const LEVEL_LABELS: Record<string, string> = {
  adaptacao: 'Adaptação',
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const LEVEL_COLORS: Record<string, string> = {
  adaptacao: 'bg-green-900 text-green-300',
  iniciante: 'bg-blue-900 text-blue-300',
  intermediario: 'bg-yellow-900 text-yellow-300',
  avancado: 'bg-red-900 text-red-300',
};

export function WorkoutPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<Record<number, WorkoutLog>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('workout_programs').select('*').order('order_index')
      .then(({ data }) => { setPrograms(data || []); setLoading(false); });
  }, []);

  const selectProgram = async (program: Program) => {
    setSelectedProgram(program);
    setSelectedSession(null);
    setExercises([]);
    const { data } = await supabase.from('workout_sessions')
      .select('*').eq('program_id', program.id).order('order_index');
    setSessions(data || []);
  };

  const selectSession = async (session: Session) => {
    setSelectedSession(session);
    const { data: exs } = await supabase.from('workout_exercises')
      .select('*').eq('session_id', session.id).order('order_index');
    setExercises(exs || []);

    // Carregar logs de hoje
    const today = new Date().toISOString().split('T')[0];
    const ids = (exs || []).map((e: Exercise) => e.id);
    if (ids.length > 0) {
      const { data: logData } = await supabase.from('workout_logs')
        .select('*').in('exercise_id', ids).eq('log_date', today);
      const logMap: Record<number, WorkoutLog> = {};
      (logData || []).forEach((l: any) => { logMap[l.exercise_id] = l; });
      setLogs(logMap);
    }
  };

  const saveLog = async (exerciseId: number, weight: string, reps: string, notes: string) => {
    setSaving(exerciseId);
    const today = new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('workout_logs').upsert({
      user_id: user.id,
      exercise_id: exerciseId,
      log_date: today,
      weight_kg: weight ? parseFloat(weight) : null,
      reps_done: reps ? parseInt(reps) : null,
      notes: notes || null,
    });

    setLogs(prev => ({
      ...prev,
      [exerciseId]: { exercise_id: exerciseId, weight_kg: weight ? parseFloat(weight) : null, reps_done: reps ? parseInt(reps) : null, notes }
    }));
    setSaving(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-text-secondary">Carregando...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary pb-12">
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        {selectedSession ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedSession(null)} className="text-accent hover:text-accent-muted">← Voltar</button>
            <div>
              <div className="text-xs text-accent font-bold uppercase tracking-wider">{selectedProgram?.name}</div>
              <h1 className="text-lg font-bold text-text-primary">{selectedSession.name}</h1>
            </div>
          </div>
        ) : selectedProgram ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedProgram(null)} className="text-accent hover:text-accent-muted">← Voltar</button>
            <div>
              <div className="text-xs text-accent font-bold uppercase tracking-wider">Treinos</div>
              <h1 className="text-lg font-bold text-text-primary">{selectedProgram.name}</h1>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Treinos</div>
            <h1 className="text-xl font-bold text-text-primary">Escolha seu Programa</h1>
            <p className="text-text-secondary text-sm mt-1">Selecione o treino que melhor se adapta ao seu nível</p>
          </div>
        )}
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">

        {/* Lista de programas */}
        {!selectedProgram && (
          <div className="space-y-3">
            {programs.map(p => (
              <button
                key={p.id}
                onClick={() => selectProgram(p)}
                className="w-full bg-bg-card border border-border rounded p-5 text-left hover:bg-bg-elevated transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${LEVEL_COLORS[p.level] || 'bg-bg-elevated text-text-secondary'}`}>
                    {LEVEL_LABELS[p.level] || p.level}
                  </span>
                  <span className="text-xs text-accent font-semibold">{p.frequency}</span>
                </div>
                <h2 className="text-text-primary font-bold text-base mb-1">{p.name}</h2>
                <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">{p.description}</p>
                <div className="mt-3 text-accent text-xs font-semibold">Ver treinos →</div>
              </button>
            ))}
          </div>
        )}

        {/* Lista de sessões */}
        {selectedProgram && !selectedSession && (
          <div className="space-y-3">
            <div className="bg-bg-card border border-border rounded p-4 mb-4">
              <p className="text-text-secondary text-sm leading-relaxed">{selectedProgram.description}</p>
            </div>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => selectSession(s)}
                className="w-full bg-bg-card border border-border rounded p-5 text-left hover:bg-bg-elevated transition-colors"
              >
                <h3 className="text-text-primary font-bold">{s.name}</h3>
                <div className="text-accent text-xs font-semibold mt-1">Ver exercícios →</div>
              </button>
            ))}
          </div>
        )}

        {/* Exercícios com anotação de cargas */}
        {selectedSession && (
          <div className="space-y-4">
            <div className="text-xs text-text-secondary bg-bg-card border border-border rounded p-3">
              📝 Anote suas cargas para acompanhar a evolução. Os dados são salvos automaticamente.
            </div>

            {exercises.map(ex => {
              const log = logs[ex.id];
              return (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  log={log}
                  saving={saving === ex.id}
                  onSave={(weight, reps, notes) => saveLog(ex.id, weight, reps, notes)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function ExerciseCard({
  exercise, log, saving, onSave
}: {
  exercise: Exercise;
  log: WorkoutLog | undefined;
  saving: boolean;
  onSave: (weight: string, reps: string, notes: string) => void;
}) {
  const [weight, setWeight] = useState(log?.weight_kg?.toString() || '');
  const [reps, setReps] = useState(log?.reps_done?.toString() || '');
  const [notes, setNotes] = useState(log?.notes || '');
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-bg-card border border-border rounded overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 pr-2">
          <div className="font-semibold text-text-primary text-sm">{exercise.name}</div>
          <div className="text-xs text-accent mt-0.5">
            {exercise.sets} séries × {exercise.reps} reps · {exercise.rest}
          </div>
          {exercise.notes && (
            <div className="text-xs text-text-secondary mt-1 italic">{exercise.notes}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {log?.weight_kg && (
            <span className="text-xs text-accent font-bold">{log.weight_kg}kg</span>
          )}
          <span className="text-text-secondary text-lg">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-4 bg-bg-elevated">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Anotação de hoje</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-text-secondary block mb-1">Carga (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="Ex: 40"
                className="w-full bg-bg-card border border-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">Reps feitas</label>
              <input
                type="number"
                value={reps}
                onChange={e => setReps(e.target.value)}
                placeholder="Ex: 10"
                className="w-full bg-bg-card border border-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-text-secondary block mb-1">Observações</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: aumentar carga na próxima"
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={() => onSave(weight, reps, notes)}
            disabled={saving}
            className="w-full bg-accent text-black font-bold py-2 rounded text-sm disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  );
}

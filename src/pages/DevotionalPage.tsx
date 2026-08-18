import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AudioPlayer } from '../components/AudioPlayer';
import { getDevotionalForDay, getAudioForDay, getDevotionalCompletion, setDevotionalCompletion } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Devotional, Audio } from '../lib/api';

export function DevotionalPage() {
  const navigate = useNavigate();
  const { dayId } = useParams<{ dayId: string }>();
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [audio, setAudio] = useState<Audio | null>(null);
  const [prevDayId, setPrevDayId] = useState<number | null>(null);
  const [nextDayId, setNextDayId] = useState<number | null>(null);
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!dayId) return;
      const dayIdNum = parseInt(dayId, 10);

      // 1. Carregar info do dia atual (week_id e day_number)
      const { data: dayInfo } = await supabase
        .from('days')
        .select('id, day_number, week_id, weeks(number)')
        .eq('id', dayIdNum)
        .single();

      if (dayInfo) {
        const wNum = (dayInfo.weeks as any)?.number ?? 1;
        setDayNumber(dayInfo.day_number);
        setWeekNumber(wNum);

        // 2. Carregar todos os dias desta semana para navegação
        const { data: weekDays } = await supabase
          .from('days')
          .select('id, day_number')
          .eq('week_id', dayInfo.week_id)
          .order('day_number');

        if (weekDays) {
          const idx = weekDays.findIndex(d => d.id === dayIdNum);

          if (idx > 0) {
            // Dia anterior na mesma semana
            setPrevDayId(weekDays[idx - 1].id);
          } else if (wNum > 1) {
            // Último dia da semana anterior
            const { data: prevWeek } = await supabase
              .from('weeks').select('id').eq('number', wNum - 1).single();
            if (prevWeek) {
              const { data: prevDays } = await supabase
                .from('days').select('id, day_number')
                .eq('week_id', prevWeek.id).order('day_number', { ascending: false }).limit(1);
              if (prevDays?.[0]) setPrevDayId(prevDays[0].id);
            }
          }

          if (idx < weekDays.length - 1) {
            // Próximo dia na mesma semana — só libera se desbloqueado
            const nextDay = weekDays[idx + 1];
            const start = await getUserStartDate();
            if (start && isDayUnlocked(wNum, nextDay.day_number, start)) {
              setNextDayId(nextDay.id);
            }
          } else if (wNum < 12) {
            // Primeiro dia da próxima semana — só libera se desbloqueado
            const { data: nextWeek } = await supabase
              .from('weeks').select('id, number').eq('number', wNum + 1).single();
            if (nextWeek) {
              const { data: nextDays } = await supabase
                .from('days').select('id, day_number')
                .eq('week_id', nextWeek.id).order('day_number').limit(1);
              if (nextDays?.[0]) {
                const start = await getUserStartDate();
                if (start && isDayUnlocked(nextWeek.number, nextDays[0].day_number, start)) {
                  setNextDayId(nextDays[0].id);
                }
              }
            }
          }
        }
      }

      // 3. Carregar devocional
      const devRes = await getDevotionalForDay(dayIdNum);
      setDevotional(devRes.data);

      // 3b. Carregar status de conclusão
      const completionRes = await getDevotionalCompletion(dayIdNum);
      setCompleted(completionRes.data);

      // 4. Carregar áudio
      const audioRes = await getAudioForDay(dayIdNum);
      if (!audioRes.error && audioRes.data) setAudio(audioRes.data);

      // 5. Carregar anotação salva
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: noteData } = await supabase
          .from('devotional_notes')
          .select('note')
          .eq('user_id', user.id)
          .eq('day_id', dayIdNum)
          .single();
        if (noteData) setNote(noteData.note);
      }

      setLoading(false);
    }

    setLoading(true);
    setPrevDayId(null);
    setNextDayId(null);
    setNote('');
    setNoteSaved(false);
    setCompleted(false);
    loadData();
  }, [dayId]);

  async function getUserStartDate(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('start_date').eq('id', user.id).single();
    return data?.start_date ?? null;
  }

  function isDayUnlocked(weekNum: number, dayNum: number, startDate: string): boolean {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= (weekNum - 1) * 7 + (dayNum - 1);
  }

  const handleToggleCompleted = async () => {
    if (!dayId || completing) return;
    const next = !completed;
    setCompleting(true);
    setCompleted(next);
    const { error } = await setDevotionalCompletion(parseInt(dayId, 10), next);
    if (error) setCompleted(!next);
    setCompleting(false);
  };

  // Salvar nota automaticamente com debounce
  const handleNoteChange = (value: string) => {
    setNote(value);
    setNoteSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(value), 1500);
  };

  const saveNote = async (value: string) => {
    if (!dayId) return;
    setNoteSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('devotional_notes').upsert({
        user_id: user.id,
        day_id: parseInt(dayId, 10),
        note: value,
        updated_at: new Date().toISOString(),
      });
    }
    setNoteSaving(false);
    setNoteSaved(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-text-secondary">Carregando...</div>
    </div>
  );

  if (!devotional) return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="text-accent">← Voltar</button>
      </header>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-4xl mb-4">📖</div>
        <h2 className="text-text-primary font-bold text-xl mb-2">Devocional em breve</h2>
        <p className="text-text-secondary text-sm max-w-xs">
          O conteúdo deste dia ainda está sendo preparado. Volte em breve.
        </p>
        <button onClick={() => navigate(-1)}
          className="mt-8 px-6 py-2 bg-accent text-black font-semibold rounded text-sm">
          Voltar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary pb-12">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-accent hover:text-accent-muted transition-colors">
            ← Voltar
          </button>
          <div className="text-xs text-text-secondary font-medium">
            Semana {weekNumber} · Dia {dayNumber}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">

        {/* Âncora */}
        <div className="mb-8">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Âncora</div>
          <p className="text-xs text-text-secondary mb-3 italic">{devotional.anchor_reference}</p>
          <div className="bg-bg-card border-l-4 border-accent p-5 rounded">
            <p className="text-text-primary leading-relaxed text-base italic">"{devotional.anchor_text}"</p>
          </div>
        </div>

        <div className="w-10 h-px bg-accent mb-8" />

        {/* Reflexão */}
        <div className="mb-8">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Reflexão</div>
          <div className="text-text-primary leading-relaxed text-sm space-y-4">
            {devotional.reflection.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-8">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Pergunta do Dia</div>
          <div className="bg-bg-card border-l-4 border-accent p-5 rounded">
            <p className="text-text-primary font-semibold leading-relaxed">{devotional.question}</p>
          </div>
        </div>

        {/* Áudio */}
        {audio && (
          <div className="mb-8">
            <div className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Reflexão em Áudio</div>
            <AudioPlayer
              audioUrl={audio.audio_url}
              title={audio.title}
              duration={audio.duration_target}
              scriptBullets={audio.script_bullets}
            />
          </div>
        )}

        {/* Anotações */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-accent uppercase tracking-wider">Minhas Anotações</div>
            <span className="text-xs text-text-secondary">
              {noteSaving ? 'Salvando...' : noteSaved ? '✓ Salvo' : ''}
            </span>
          </div>
          <textarea
            value={note}
            onChange={e => handleNoteChange(e.target.value)}
            placeholder="Escreva sua resposta à pergunta do dia, insights ou o que Deus falou com você hoje..."
            rows={6}
            className="w-full bg-bg-card border border-border rounded p-4 text-text-primary text-sm leading-relaxed resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary"
          />
          <p className="text-xs text-text-secondary mt-1">Salvo automaticamente · Visível apenas para você</p>
        </div>

        {/* Concluir devocional */}
        <div className="mb-8">
          <button
            onClick={handleToggleCompleted}
            disabled={completing}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded text-sm font-semibold border transition-colors disabled:opacity-60 ${
              completed
                ? 'bg-accent border-accent text-black'
                : 'border-accent text-accent hover:bg-accent hover:text-black'
            }`}
          >
            <span>{completed ? '✓' : '○'}</span>
            {completed ? 'Devocional concluído' : 'Marcar devocional como concluído'}
          </button>
        </div>

        {/* Navegação */}
        <div className="flex gap-3 justify-between">
          <button
            disabled={!prevDayId}
            onClick={() => prevDayId && navigate(`/day/${prevDayId}`)}
            className={`flex-1 py-3 px-4 rounded text-sm font-semibold border transition-colors ${
              prevDayId
                ? 'border-accent text-accent hover:bg-accent hover:text-black'
                : 'border-border text-text-secondary cursor-not-allowed opacity-40'
            }`}
          >
            ← Dia Anterior
          </button>
          <button
            disabled={!nextDayId}
            onClick={() => nextDayId && navigate(`/day/${nextDayId}`)}
            className={`flex-1 py-3 px-4 rounded text-sm font-semibold border transition-colors ${
              nextDayId
                ? 'border-accent text-accent hover:bg-accent hover:text-black'
                : 'border-border text-text-secondary cursor-not-allowed opacity-40'
            }`}
          >
            Próximo Dia →
          </button>
        </div>
      </main>
    </div>
  );
}

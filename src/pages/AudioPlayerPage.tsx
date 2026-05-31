import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { getAudioForDay } from '../lib/api';
import type { Audio } from '../lib/api';

export function AudioPlayerPage() {
  const navigate = useNavigate();
  const { dayId } = useParams<{ dayId: string }>();
  const [audio, setAudio] = useState<Audio | null>(null);
  const [prevDayId, setPrevDayId] = useState<number | null>(null);
  const [nextDayId, setNextDayId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!dayId) {
          setError('Day ID not provided');
          setLoading(false);
          return;
        }

        const dayIdNum = parseInt(dayId, 10);

        // Get audio for this day
        const audioRes = await getAudioForDay(dayIdNum);
        if (audioRes.error) {
          setError(audioRes.error);
          setLoading(false);
          return;
        }

        setAudio(audioRes.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, [dayId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error || !audio) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">{error || 'Audio not found'}</div>
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
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-8">{audio.title}</h1>

        <AudioPlayer
          audioUrl={audio.audio_url}
          title={audio.title}
          duration={audio.duration_target}
          scriptBullets={audio.script_bullets}
        />

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-12">
          <Button
            variant="secondary"
            size="md"
            disabled={!prevDayId}
            onClick={() => prevDayId && navigate(`/day/${prevDayId}`)}
          >
            ← Dia Anterior
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={!nextDayId}
            onClick={() => nextDayId && navigate(`/day/${nextDayId}`)}
          >
            Próximo Dia →
          </Button>
        </div>
      </main>
    </div>
  );
}

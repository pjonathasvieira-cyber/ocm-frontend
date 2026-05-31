import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

interface AudioPlayerProps {
  audioUrl?: string;
  title: string;
  duration?: string;
  scriptBullets?: string[];
}

const AudioPlayer = React.forwardRef<HTMLDivElement, AudioPlayerProps>(
  ({ audioUrl, title, duration = '5–7 min', scriptBullets = [] }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setTotalDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }, []);

    const handlePlayPause = () => {
      if (!audioRef.current || !audioUrl) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = parseFloat(e.target.value);
    };

    const formatTime = (seconds: number): string => {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    if (!audioUrl) {
      return (
        <div ref={ref} className="bg-bg-card p-6 rounded border border-border text-center">
          <p className="text-text-secondary">Áudio indisponível</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-bg-card p-6 rounded border border-border">
        <audio ref={audioRef} src={audioUrl} />

        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {title}
        </h4>

        <div className="flex flex-col items-center gap-4">
          {/* Play Button */}
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-accent hover:bg-accent-muted transition-colors flex items-center justify-center"
          >
            {isPlaying ? (
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 1.5A1.25 1.25 0 014.5 2.75v14.5a1.25 1.25 0 001.25 1.25h1.25a1.25 1.25 0 001.25-1.25V2.75A1.25 1.25 0 006.75 1.5h-1zm8 0a1.25 1.25 0 00-1.25 1.25v14.5a1.25 1.25 0 001.25 1.25h1.25a1.25 1.25 0 001.25-1.25V2.75a1.25 1.25 0 00-1.25-1.25h-1z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <div className="text-sm text-text-secondary">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={totalDuration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-bg-elevated rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #C9A050 0%, #C9A050 ${
                (currentTime / (totalDuration || 1)) * 100
              }%, #2A2A2A ${(currentTime / (totalDuration || 1)) * 100}%, #2A2A2A 100%)`,
            }}
          />

          {/* Duration Info */}
          <p className="text-xs text-text-secondary">{duration}</p>
        </div>

        {/* Script Bullets */}
        {scriptBullets.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h5 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Resumo</h5>
            <ul className="space-y-2">
              {scriptBullets.map((bullet, idx) => (
                <li key={idx} className="text-sm text-text-primary flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';

export { AudioPlayer };

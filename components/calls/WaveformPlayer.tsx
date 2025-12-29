import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

let DEMO_WAV_BLOB: Blob | null = null;
let DEMO_WAV_URL: string | null = null;
let CURRENT_AUDIO: HTMLAudioElement | null = null;

function hashStringToUint32(str: string) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const blockAlign = 1 * bytesPerSample; // mono
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);
  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

function getDemoWavBlob() {
  if (DEMO_WAV_BLOB) return DEMO_WAV_BLOB;

  // 5s “demo call” tone (generated at runtime so we don't ship binary assets)
  const sampleRate = 44100;
  const durationSec = 5;
  const length = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // gentle amplitude envelope
    const env = Math.min(1, t / 0.15) * Math.min(1, (durationSec - t) / 0.25);
    // quasi “voice-ish” tone: mix two sines + a tiny bit of noise
    const tone = Math.sin(2 * Math.PI * 220 * t) * 0.55 + Math.sin(2 * Math.PI * 440 * t) * 0.25;
    const noise = (Math.random() * 2 - 1) * 0.03;
    samples[i] = (tone + noise) * 0.35 * env;
  }

  DEMO_WAV_BLOB = encodeWav(samples, sampleRate);
  return DEMO_WAV_BLOB;
}

function getDemoWavUrl() {
  if (DEMO_WAV_URL) return DEMO_WAV_URL;
  const blob = getDemoWavBlob();
  DEMO_WAV_URL = URL.createObjectURL(blob);
  return DEMO_WAV_URL;
}

export type WaveformPlayerProps = {
  callId: string;
  recordingUrl?: string;
  /**
   * True only for the row that the parent considers “currently playing”.
   * When this flips to false, this component will pause itself (if it was playing).
   */
  isCurrentlyPlaying: boolean;
  onPlayStateChange: (callId: string, playing: boolean) => void;
  /**
   * Optional playback progress callback (seconds).
   * Fires on timeupdate while playing, and on metadata load (duration).
   */
  onProgress?: (callId: string, currentTimeSec: number, durationSec: number) => void;
};

export function WaveformPlayer({
  callId,
  recordingUrl,
  isCurrentlyPlaying,
  onPlayStateChange,
  onProgress,
}: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const onProgressRef = useRef(onProgress);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasEverBeenCurrentRef = useRef(false);

  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange;
  }, [onPlayStateChange]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const demoBars = useMemo(() => {
    const seed = hashStringToUint32(callId);
    const rand = mulberry32(seed);
    const count = 34;
    const bars: number[] = [];

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const envelope = Math.sin(t * Math.PI); // 0..1..0
      const jitter = 0.65 + rand() * 0.45;
      const v = Math.max(0.08, Math.min(1, envelope * jitter));
      bars.push(v);
    }

    return bars;
  }, [callId]);

  useEffect(() => {
    // Create a single audio element instance per component.
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;
    const demoUrl = getDemoWavUrl();
    const desired = recordingUrl && recordingUrl !== '#' ? recordingUrl : demoUrl;

    audio.src = desired;
    audio.load();

    // Enable play immediately; actual play is still gated by user click policies.
    setIsReady(true);

    const onPlay = () => {
      setIsPlaying(true);
      onPlayStateChangeRef.current(callId, true);
      onProgressRef.current?.(callId, audio.currentTime || 0, Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onPause = () => {
      setIsPlaying(false);
      onPlayStateChangeRef.current(callId, false);
      hasEverBeenCurrentRef.current = false;
      if (CURRENT_AUDIO === audio) CURRENT_AUDIO = null;
    };
    const onEnded = () => {
      setIsPlaying(false);
      onPlayStateChangeRef.current(callId, false);
      hasEverBeenCurrentRef.current = false;
      if (CURRENT_AUDIO === audio) CURRENT_AUDIO = null;
    };
    const onError = () => {
      // If remote audio fails (CORS/404), fall back to demo wav.
      if (audio.src !== demoUrl) {
        audio.src = demoUrl;
        audio.load();
      }
    };
    const onLoadedMetadata = () => {
      onProgressRef.current?.(callId, audio.currentTime || 0, Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onTimeUpdate = () => {
      if (audio.paused) return;
      onProgressRef.current?.(callId, audio.currentTime || 0, Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      // Cleanup + ensure we don't keep playing on unmount
      if (CURRENT_AUDIO === audio) CURRENT_AUDIO = null;
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [callId, recordingUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;
    // Pause only if we WERE the active one and now we're not (avoids "first click" self-pause).
    if (!isCurrentlyPlaying && hasEverBeenCurrentRef.current && !audio.paused) {
      audio.pause();
    }
  }, [isCurrentlyPlaying, isReady]);

  useEffect(() => {
    if (isCurrentlyPlaying) hasEverBeenCurrentRef.current = true;
  }, [isCurrentlyPlaying]);

  useEffect(() => {
    if (!isPlaying) hasEverBeenCurrentRef.current = false;
  }, [isPlaying]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      const demoUrl = getDemoWavUrl();
      // Enforce single playback globally: starting one pauses any other currently playing audio.
      if (CURRENT_AUDIO && CURRENT_AUDIO !== audio) {
        CURRENT_AUDIO.pause();
      }
      CURRENT_AUDIO = audio;
      // Try to play. If it fails (CORS/unsupported/late load), swap to demo WAV and try again
      // within the same user gesture so it starts on first click.
      audio.muted = false;
      audio.volume = 1;
      audio.playbackRate = 1;
      void audio
        .play()
        .then(() => {
          // If playback "starts" but doesn't actually advance (can happen right after a load),
          // retry once to avoid the "first click shows pause but no sound" behavior.
          window.setTimeout(() => {
            const a = audioRef.current;
            if (!a || a !== audio) return;
            if (!a.paused && a.currentTime < 0.01) {
              a.pause();
              a.currentTime = 0;
              void a.play().catch(() => {
                // ignore
              });
            }
          }, 300);
        })
        .catch(() => {
          if (audio.src !== demoUrl) {
            audio.src = demoUrl;
            audio.load();
            return audio.play();
          }
          return undefined;
        })
        .catch(() => {
          // ignore
        });
    } else {
      audio.pause();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-8 relative">
        <div ref={waveformRef} className="w-full h-full">
          <svg
            viewBox={`0 0 ${demoBars.length} 32`}
            preserveAspectRatio="none"
            className={`w-full h-full ${isPlaying ? 'opacity-100' : 'opacity-90'} transition-opacity`}
          >
            {demoBars.map((v, i) => {
              const h = Math.max(2, v * 28);
              const y = (32 - h) / 2;
              const fill = isPlaying ? '#3b82f6' : '#cbd5e1';
              return <rect key={i} x={i + 0.15} y={y} width={0.7} height={h} rx={0.35} fill={fill} />;
            })}
          </svg>
        </div>
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
      <button
        onClick={handlePlayPause}
        disabled={!isReady}
        className={`p-2 rounded-lg border transition-all shadow-sm ${
          isPlaying
            ? 'bg-blue-50 border-blue-300 text-blue-600'
            : 'bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border-slate-200 hover:border-blue-200'
        } ${!isReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isPlaying ? 'Դադարեցնել' : 'Նվագարկել'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
      </button>
    </div>
  );
}



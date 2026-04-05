import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface MuxVideoPlayerProps {
  playbackId: string;
  title?: string;
  startTime?: number; // tiempo en segundos desde donde empezar
  onProgress?: (pct: number) => void;
  onPlay?: () => void;
  onError?: (msg: string) => void;
}

export function MuxVideoPlayer({ playbackId, title, startTime, onProgress, onPlay, onError }: MuxVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const startTimeHasJumped = useRef(false);

  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    setHasError(false);
    setIsLoading(true);

    const handleError = (msg: string) => {
      setHasError(true);
      setErrorMsg(msg);
      setIsLoading(false);
      onError?.(msg);
    };

    if (Hls.isSupported()) {
      // Chrome, Firefox, etc. — necesitan HLS.js
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (startTime && startTime > 0 && !startTimeHasJumped.current) {
          video.currentTime = startTime;
          startTimeHasJumped.current = true;
        }
        console.log('[MuxPlayer] HLS manifest parsed, ready to play');
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('[MuxPlayer] Fatal HLS error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleError('Error de red al cargar el video. Verifica que el video existe en MUX.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              handleError('Error de media al reproducir el video.');
              break;
            default:
              handleError('Error al cargar el video de MUX.');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari — soporta HLS nativo
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (startTime && startTime > 0 && !startTimeHasJumped.current) {
          video.currentTime = startTime;
          startTimeHasJumped.current = true;
        }
      }, { once: true });
      video.addEventListener('error', () => handleError('Error al cargar el video.'), { once: true });
    } else {
      handleError('Tu navegador no soporta reproducción de video HLS.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackId]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      onProgress?.(pct);
    };

    const handlePlay = () => {
      onPlay?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
    };
  }, [onProgress, onPlay]);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4 p-6">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-400 text-sm text-center">{errorMsg}</p>
        <p className="text-slate-500 text-xs font-mono text-center break-all">ID: {playbackId}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        controls
        poster={thumbnailUrl}
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
        onLoadedData={() => setIsLoading(false)}
        title={title}
      />
    </div>
  );
}

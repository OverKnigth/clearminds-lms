import { useState, useRef } from 'react';
import { api } from '../../../../shared/services/api';

interface MuxVideoUploaderProps {
  title?: string; // título del contenido para etiquetar en MUX
  onSuccess: (playbackId: string, assetId: string, durationMinutes?: number) => void;
  onError?: (msg: string) => void;
}

type Mode = 'choose' | 'file' | 'url';
type UploadState = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

export function MuxVideoUploader({ title, onSuccess, onError }: MuxVideoUploaderProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // ── Polling asset status ────────────────────────────────────────────────────
  const pollAsset = (assetId: string) => {
    setUploadState('processing');
    setStatusMsg('MUX está procesando el video...');
    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.muxGetAssetStatus(assetId);
        if (data.status === 'ready' && data.playbackId) {
          stopPolling();
          setUploadState('ready');
          setStatusMsg('¡Video listo!');
          const durationMins = data.duration ? Math.ceil(data.duration / 60) : undefined;
          onSuccess(data.playbackId, assetId, durationMins);
        } else if (data.status === 'errored') {
          stopPolling();
          setUploadState('error');
          setStatusMsg('Error al procesar el video en MUX');
          onError?.('Error al procesar el video en MUX');
        }
      } catch {
        // keep polling
      }
    }, 3000);
  };

  // ── Upload file ─────────────────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    setUploadState('uploading');
    setProgress(0);
    setStatusMsg('Obteniendo URL de subida...');
    try {
      const { uploadId, uploadUrl } = await api.muxCreateUploadUrl(title);
      setStatusMsg('Subiendo video a MUX...');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Error de red'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/*');
        xhr.send(file);
      });

      setProgress(100);
      setStatusMsg('Video subido, esperando procesamiento...');

      // Poll upload status to get assetId
      const waitForAsset = setInterval(async () => {
        try {
          const data = await api.muxGetUploadStatus(uploadId);
          if (data.assetId) {
            clearInterval(waitForAsset);
            pollAsset(data.assetId);
          } else if (data.status === 'errored' || data.status === 'cancelled') {
            clearInterval(waitForAsset);
            setUploadState('error');
            setStatusMsg('Error en la subida a MUX');
            onError?.('Error en la subida a MUX');
          }
        } catch { /* keep polling */ }
      }, 2000);
    } catch (err: any) {
      setUploadState('error');
      setStatusMsg(err.message || 'Error al subir el video');
      onError?.(err.message || 'Error al subir el video');
    }
  };

  // ── Import from URL ─────────────────────────────────────────────────────────
  const handleUrlImport = async () => {
    if (!externalUrl.trim()) return;
    setUploadState('uploading');
    setStatusMsg('Enviando URL a MUX...');
    try {
      const data = await api.muxImportFromUrl(externalUrl.trim(), title);
      if (data.status === 'ready' && data.playbackId) {
        setUploadState('ready');
        setStatusMsg('¡Video listo!');
        onSuccess(data.playbackId, data.assetId);
      } else {
        pollAsset(data.assetId);
      }
    } catch (err: any) {
      setUploadState('error');
      setStatusMsg(err.message || 'Error al importar la URL');
      onError?.(err.message || 'Error al importar la URL');
    }
  };

  const reset = () => {
    stopPolling();
    setMode('choose');
    setUploadState('idle');
    setProgress(0);
    setStatusMsg('');
    setExternalUrl('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (uploadState === 'uploading' || uploadState === 'processing') {
    return (
      <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin shrink-0" />
          <p className="text-sm text-slate-300">{statusMsg}</p>
        </div>
        {uploadState === 'uploading' && mode === 'file' && (
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <p className="text-xs text-slate-500">No cierres esta ventana hasta que termine.</p>
      </div>
    );
  }

  if (uploadState === 'ready') {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Video procesado y listo en MUX</span>
        </div>
        <button onClick={reset} className="text-xs text-slate-400 hover:text-white underline">Cambiar</button>
      </div>
    );
  }

  if (uploadState === 'error') {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
        <p className="text-sm text-red-400">{statusMsg}</p>
        <button onClick={reset} className="text-xs text-slate-400 hover:text-white underline">Reintentar</button>
      </div>
    );
  }

  // Mode: choose
  if (mode === 'choose') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('file')}
          className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-700 hover:border-red-500 rounded-xl transition-all group"
        >
          <svg className="w-8 h-8 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-xs font-medium text-slate-400 group-hover:text-white">Subir archivo</span>
          <span className="text-[10px] text-slate-600">MP4, MOV, AVI...</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-700 hover:border-red-500 rounded-xl transition-all group"
        >
          <svg className="w-8 h-8 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-xs font-medium text-slate-400 group-hover:text-white">Importar URL</span>
          <span className="text-[10px] text-slate-600">YouTube, Vimeo, Drive...</span>
        </button>
      </div>
    );
  }

  // Mode: file
  if (mode === 'file') {
    return (
      <div className="space-y-3">
        <div
          className="border-2 border-dashed border-slate-600 hover:border-red-500 rounded-xl p-6 text-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-slate-400">Arrastra tu video aquí o <span className="text-red-400 underline">selecciona un archivo</span></p>
          <p className="text-xs text-slate-600 mt-1">MP4, MOV, AVI, MKV — máx. recomendado 2GB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>
        <button type="button" onClick={reset} className="text-xs text-slate-500 hover:text-white underline">← Volver</button>
      </div>
    );
  }

  // Mode: url
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
        <button
          type="button"
          onClick={handleUrlImport}
          disabled={!externalUrl.trim()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Importar
        </button>
      </div>
      <p className="text-xs text-slate-500">MUX descargará e indexará el video desde esa URL.</p>
      <button type="button" onClick={reset} className="text-xs text-slate-500 hover:text-white underline">← Volver</button>
    </div>
  );
}

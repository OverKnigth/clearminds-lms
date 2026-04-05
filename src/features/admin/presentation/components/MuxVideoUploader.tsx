import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { api } from '../../../../shared/services/api';

interface MuxVideoUploaderProps {
  title?: string;
  onFileSelect?: (file: File | null) => void;
  onSuccess: (playbackId: string, assetId: string, durationMinutes?: number) => void;
  onError?: (msg: string) => void;
}

export interface MuxVideoUploaderHandle {
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

export const MuxVideoUploader = forwardRef<MuxVideoUploaderHandle, MuxVideoUploaderProps>(
  ({ title, onFileSelect, onSuccess, onError }, ref) => {
    const [uploadState, setUploadState] = useState<'idle' | 'selected' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const reset = () => {
      stopPolling();
      setUploadState('idle');
      setProgress(0);
      setStatusMsg('');
      setSelectedFile(null);
      onFileSelect?.(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useImperativeHandle(ref, () => ({
      upload: async (file: File) => {
        await handleFileUpload(file);
      },
      reset
    }));

    const handleFileChange = (file: File) => {
      setSelectedFile(file);
      setUploadState('selected');
      onFileSelect?.(file);
    };

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
        } catch { /* keep polling */ }
      }, 3000);
    };

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
        throw err;
      }
    };

    if (uploadState === 'uploading' || uploadState === 'processing') {
      return (
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin shrink-0" />
            <p className="text-sm text-slate-300">{statusMsg}</p>
          </div>
          {uploadState === 'uploading' && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
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
            <span className="text-sm font-medium">Video cargado correctamente</span>
          </div>
          <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-white underline font-black uppercase tracking-widest transition-colors">Cambiar</button>
        </div>
      );
    }

    if (uploadState === 'selected' && selectedFile) {
      return (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Listo para subir</p>
            </div>
          </div>
          <button type="button" onClick={reset} className="text-xs text-slate-500 hover:text-white underline font-black uppercase tracking-widest transition-colors">Quitar</button>
        </div>
      );
    }

    if (uploadState === 'error') {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-400 font-bold uppercase tracking-tighter">{statusMsg}</p>
          <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-white underline font-black uppercase tracking-widest transition-colors">Reintentar</button>
        </div>
      );
    }

    return (
      <div
        className="border-2 border-dashed border-slate-700 hover:border-red-500/50 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900 group"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFileChange(file);
        }}
      >
        <svg className="w-12 h-12 text-slate-600 mx-auto mb-3 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Seleccionar video</p>
        <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">Se subirá al guardar el contenido</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />
      </div>
    );
  }
);

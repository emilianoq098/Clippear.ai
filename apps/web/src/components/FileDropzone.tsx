'use client';

import { useRef, useState } from 'react';

type FileKind = 'media' | 'audio';
type UploadedAsset = { id: string; filename: string; sizeBytes: number; status: 'queued'; jobId: string };
type ProcessJob = {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error?: string;
  clips: { id: string; title: string; reason: string; score: number; startSeconds: number; endSeconds: number }[];
};
type DownloadClip = ProcessJob['clips'][number] & { jobId: string };
const videoTypes = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function FileDropzone({ lang, kind = 'media', className = '', id = 'upload' }: { lang: 'es' | 'en'; kind?: FileKind; className?: string; id?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [clips, setClips] = useState<DownloadClip[]>([]);
  const english = lang === 'en';
  const audio = kind === 'audio';
  const localHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || (localHost ? 'http://localhost:4000' : '')).replace(/\/$/, '');
  const label = audio
    ? (english ? 'Drop an audio track to add' : 'Soltá un audio para agregar una pista')
    : (english ? 'Drop a video or your photos' : 'Soltá un video o tus fotos');
  const browse = audio
    ? (english ? 'or choose an audio file' : 'o elegí un archivo de audio')
    : (english ? 'or choose them from your computer' : 'o elegilos desde tu computadora');
  const accept = audio ? 'audio/*' : 'video/mp4,video/quicktime,video/webm,image/*';

  const updateFiles = (list: FileList | null) => {
    const selected = list ? Array.from(list) : [];
    const accepted = audio ? selected.filter((file) => file.type.startsWith('audio/')) : selected.filter((file) => videoTypes.has(file.type));
    const photos = !audio && selected.some((file) => file.type.startsWith('image/'));
    setFiles(accepted);
    setStatus(photos
      ? (english ? 'Photos can be selected here; photo-to-video processing is the next step.' : 'Podés elegir fotos acá; convertirlas en video queda para la próxima etapa.')
      : selected.length > accepted.length
      ? (english ? 'This step currently accepts MP4, MOV, or WebM videos.' : 'Por ahora, esta etapa acepta videos MP4, MOV o WebM.')
      : audio && accepted.length
        ? (english ? 'Audio upload is planned for a later step.' : 'La carga de audio queda para una etapa siguiente.')
        : '');
  };

  const upload = async () => {
    if (!files.length || audio) return;
    setUploading(true);
    setStatus(english ? 'Uploading video…' : 'Subiendo video…');
    try {
      if (!apiBase) throw new Error(english ? 'Online upload is not configured yet.' : 'La carga online todavía no está conectada.');
      for (const file of files) {
        setStatus(english ? `Uploading ${file.name}…` : `Subiendo ${file.name}…`);
        const response = await fetch(`${apiBase}/v1/assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name),
            'X-Media-Type': file.type,
          },
          body: file,
        });
        const result = await response.json().catch(() => ({})) as UploadedAsset & { error?: string };
        if (!response.ok) throw new Error(result.error || (english ? 'Upload failed.' : 'No se pudo subir el video.'));
        if (!result.jobId) throw new Error(english ? 'The processing job was not created.' : 'No se pudo crear el trabajo de análisis.');

        let finished = false;
        for (let attempt = 0; attempt < 600; attempt += 1) {
          await wait(2000);
          const jobResponse = await fetch(`${apiBase}/v1/jobs/${result.jobId}`, { cache: 'no-store' });
          const job = await jobResponse.json().catch(() => ({})) as ProcessJob & { error?: string };
          if (!jobResponse.ok) throw new Error(job.error || (english ? 'Could not read processing status.' : 'No se pudo consultar el estado del análisis.'));
          if (job.status === 'failed') throw new Error(job.error || (english ? 'Video analysis failed.' : 'Falló el análisis del video.'));
          setStatus(english ? `Analyzing video… ${job.progress}%` : `Analizando el video… ${job.progress}%`);
          if (job.status === 'completed') {
            setClips((current) => [...current, ...job.clips.map((clip) => ({ ...clip, jobId: result.jobId }))]);
            finished = true;
            break;
          }
        }
        if (!finished) throw new Error(english ? 'The job is still running. Check again in a moment.' : 'El trabajo sigue procesándose. Volvé a consultar en un momento.');
      }

      setStatus(english
        ? 'Your clips are ready to download.'
        : 'Tus clips están listos para descargar.');
      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : (english ? 'Upload failed.' : 'No se pudo subir el video.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`drop-zone-wrap ${className.includes('drop-zone--wide') ? 'drop-zone-wrap--wide' : ''}`}>
      <div
        className={`drop-zone ${className} ${dragging ? 'drop-zone--active' : ''}`}
        id={id}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); updateFiles(event.dataTransfer.files); }}
      >
        <span className="drop-icon" aria-hidden="true">↥</span>
        <span className="drop-zone__copy">
          <b>{files.length ? (english ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : `${files.length} archivo${files.length === 1 ? '' : 's'} seleccionado${files.length === 1 ? '' : 's'}`) : label}</b>
          <small>{files.length ? files.map((file) => file.name).join(', ') : browse}</small>
        </span>
        <button className="drop-zone__button" type="button" onClick={() => inputRef.current?.click()} aria-label={audio ? (english ? 'Choose an audio file' : 'Elegir un archivo de audio') : (english ? 'Choose a video file' : 'Elegir un video')} disabled={uploading}>{files.length ? '✓' : '+'}</button>
        {files.length > 0 && !audio && <button className="drop-zone__upload" type="button" onClick={upload} disabled={uploading}>{uploading ? (english ? 'Working…' : 'Procesando…') : (english ? 'Create clips' : 'Crear clips')}</button>}
        <input ref={inputRef} className="visually-hidden" type="file" accept={accept} multiple={!audio} tabIndex={-1} aria-hidden="true" onChange={(event) => updateFiles(event.currentTarget.files)} />
      </div>
      {status && <p className="drop-zone__status" role="status">{status}</p>}
      {clips.length > 0 && <div className="drop-zone__results" aria-label={english ? 'Generated clips' : 'Clips generados'}>
        {clips.map((clip) => <article className="drop-zone__clip" key={`${clip.jobId}-${clip.id}`}>
          <div><b>{clip.title}</b><small>{formatTime(clip.startSeconds)}–{formatTime(clip.endSeconds)} · {clip.score}/100</small><p>{clip.reason}</p></div>
          <a href={`${apiBase}/v1/jobs/${clip.jobId}/clips/${clip.id}`} download>{english ? 'Download' : 'Descargar'} ↗</a>
        </article>)}
      </div>}
    </div>
  );
}

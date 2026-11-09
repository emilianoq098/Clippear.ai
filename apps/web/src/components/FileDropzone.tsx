'use client';

import { useRef, useState } from 'react';

type FileKind = 'media' | 'audio';

export default function FileDropzone({ lang, kind = 'media', className = '', id = 'upload' }: { lang: 'es' | 'en'; kind?: FileKind; className?: string; id?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const english = lang === 'en';
  const audio = kind === 'audio';
  const label = audio
    ? (english ? 'Drop an audio track to add' : 'Soltá un audio para agregar una pista')
    : (english ? 'Drop a video or your photos' : 'Soltá un video o tus fotos');
  const browse = audio
    ? (english ? 'or choose an audio file' : 'o elegí un archivo de audio')
    : (english ? 'or choose video and photos' : 'o elegí un video o tus fotos');
  const accept = audio ? 'audio/*' : 'video/*,image/*';
  const updateFiles = (list: FileList | null) => {
    const allowed = list ? Array.from(list).filter((file) => audio ? file.type.startsWith('audio/') : file.type.startsWith('video/') || file.type.startsWith('image/')) : [];
    setFiles(allowed.map((file) => file.name));
  };

  return (
    <div className={`drop-zone ${className} ${dragging ? 'drop-zone--active' : ''}`} id={id} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); updateFiles(event.dataTransfer.files); }}>
      <span className="drop-icon" aria-hidden="true">↥</span>
      <span className="drop-zone__copy"><b>{files.length ? (english ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : `${files.length} archivo${files.length === 1 ? '' : 's'} seleccionado${files.length === 1 ? '' : 's'}`) : label}</b><small>{files.length ? (english ? 'Online upload is coming soon' : 'La carga online estará disponible pronto') : browse}</small></span>
      <button className="drop-zone__button" type="button" onClick={() => inputRef.current?.click()} aria-label={audio ? (english ? 'Choose an audio file' : 'Elegir un archivo de audio') : (english ? 'Choose video or photo files' : 'Elegir videos o fotos')}>{files.length ? '✓' : '+'}</button>
      <input ref={inputRef} className="visually-hidden" type="file" accept={accept} multiple tabIndex={-1} aria-hidden="true" onChange={(event) => updateFiles(event.currentTarget.files)} />
    </div>
  );
}

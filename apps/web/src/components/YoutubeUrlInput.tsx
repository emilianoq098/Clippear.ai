'use client';

import { useState, type FormEvent } from 'react';

export default function YoutubeUrlInput({ lang }: { lang: 'es' | 'en' }) {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [videoId, setVideoId] = useState('');
  const english = lang === 'en';

  const addUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const pastedUrl = url.trim();
      const parsed = new URL(/^[a-z][a-z\d+.-]*:/i.test(pastedUrl) ? pastedUrl : `https://${pastedUrl}`);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      if (!['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) throw new Error('Invalid host');
      const segments = parsed.pathname.split('/').filter(Boolean);
      const id = host === 'youtu.be'
        ? segments[0]
        : segments[0] === 'watch'
          ? parsed.searchParams.get('v')
          : ['shorts', 'embed', 'live'].includes(segments[0]) ? segments[1] : null;
      if (!id || !/^[\w-]{11}$/.test(id)) throw new Error('Invalid video id');
      setUrl(parsed.toString());
      setVideoId(id);
      setMessage(english
        ? 'Preview ready. To create clips, upload the video file; YouTube link processing is not connected yet.'
        : 'Vista previa lista. Para crear clips, subí el archivo: el procesamiento directo de links de YouTube aún no está conectado.');
    } catch {
      setVideoId('');
      setMessage(english ? 'Enter a valid YouTube video link.' : 'Pegá un enlace válido de un video de YouTube.');
    }
  };

  return (
    <div className="youtube-url-entry">
      <form className="youtube-url-band" onSubmit={addUrl}>
        <span className="youtube-url-icon" aria-hidden="true">▶</span>
        <label className="visually-hidden" htmlFor="youtube-video-url">{english ? 'YouTube video URL' : 'URL del video de YouTube'}</label>
        <input
          id="youtube-video-url"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoComplete="url"
          placeholder={english ? 'Paste a YouTube video link' : 'Pegá el enlace de un video de YouTube'}
          value={url}
          onChange={(event) => { setUrl(event.target.value); setMessage(''); setVideoId(''); }}
          aria-describedby="youtube-url-status"
          required
        />
        <button type="submit">{english ? 'Preview' : 'Ver video'} <span aria-hidden="true">↗</span></button>
      </form>
      {message && <p className={`youtube-url-status${videoId ? ' youtube-url-status--info' : ' youtube-url-status--error'}`} id="youtube-url-status" aria-live="polite">{message}</p>}
      {videoId && <div className="youtube-preview"><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={english ? 'YouTube video preview' : 'Vista previa del video de YouTube'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
    </div>
  );
}

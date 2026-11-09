'use client';

import { useState } from 'react';

export default function BeforeAfter({ lang }: { lang: 'es' | 'en' }) {
  const [split, setSplit] = useState(48);
  const english = lang === 'en';
  return (
    <div className="comparison">
      <div className="comparison__labels"><span>{english ? '1 HOUR SOURCE' : '1 HORA DE VIDEO'}</span><span>{english ? '8 READY-TO-POST CLIPS' : '8 CLIPS PARA PUBLICAR'}</span></div>
      <div className="comparison__stage">
        <div className="source-film"><div className="source-film__image"><div className="source-person" /><div className="source-mic" /></div><div className="source-wave" /></div>
        <div className="results-film" style={{ clipPath: `inset(0 0 0 ${split}%)` }}><div className="results-film__grid">{Array.from({ length: 8 }, (_, index) => <div className={`result-tile result-tile--${index + 1}`} key={index}><span>{`0${index + 1}`}</span></div>)}</div></div>
        <div className="comparison__divider" style={{ left: `${split}%` }}><span>↔</span></div>
        <input aria-label={english ? 'Compare the original with the clips' : 'Compará el original con los clips'} type="range" min="22" max="78" value={split} onChange={(event) => setSplit(Number(event.target.value))} />
      </div>
      <p className="comparison__caption">{english ? 'One conversation. Eight moments worth sharing.' : 'Una charla. Ocho momentos que vale la pena compartir.'}</p>
    </div>
  );
}

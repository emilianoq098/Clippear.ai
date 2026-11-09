'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import type { PointerEvent } from 'react';

const moments = [
  { at: '00:08', score: '94', title: 'La pregunta que lo cambió todo', tint: 'coral' },
  { at: '00:21', score: '91', title: 'El momento más honesto', tint: 'violet' },
  { at: '00:39', score: '88', title: 'Cuando no pudo parar de reír', tint: 'blue' },
  { at: '00:57', score: '86', title: 'La idea que nadie esperaba', tint: 'gold' },
  { at: '01:14', score: '83', title: 'Un cierre para recordar', tint: 'pink' },
];

const bars = [18,26,34,22,46,56,30,40,64,36,25,48,72,40,29,52,42,67,34,22,48,58,29,70,45,31,52,77,36,23,44,60,35,52,28,68,42,26,50,74,36,23,45,62,31,54,70,38,26,48,64,34,56,28,70,42,25,48,74,34,59,37,51,67,29,44,58,33,70,42,28,54,64,36,48,72,31,56,40,25,61,44,30,69,36,53,27,48,64,35,56,23,43,72,38,60,32,51,68,28,46,58,34,72,40,25,52,66,37,58,30,48,74,34,55,42,28,62,36,51,70,32,47,59,26,54,68];

export default function HighlightDemo({ lang }: { lang: 'es' | 'en' }) {
  const reduceMotion = useReducedMotion();
  const english = lang === 'en';
  const rootRef = useRef<HTMLDivElement>(null);
  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !rootRef.current) return;
    const bounds = rootRef.current.getBoundingClientRect();
    rootRef.current.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    rootRef.current.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  };
  return (
    <div ref={rootRef} className="demo-window" onPointerMove={trackPointer} aria-label={english ? 'Animated demo: five highlights on a video timeline' : 'Demo animada: cinco momentos destacados en una línea de tiempo'}>
      <div className="demo-window__top">
        <div className="demo-file"><span className="file-glyph">▰</span><span>entrevista-final.mp4</span><span className="demo-duration">01:32:18</span></div>
        <span className="analysis-status"><i /> {english ? '5 moments found' : '5 momentos encontrados'}</span>
      </div>
      <div className="demo-video">
        <div className="demo-video__scene scene-stage">
          <div className="scene-light" /><div className="scene-figure scene-figure--one" /><div className="scene-figure scene-figure--two" />
          <div className="scene-caption">{english ? '“That’s what made me change my mind.”' : '“Eso fue lo que me hizo cambiar de idea.”'}</div>
          <div className="scene-play"><span /></div><span className="scene-timecode">00:38:42:16</span>
        </div>
        <div className="demo-side-note"><span className="side-note-mark">✳</span><span>{english ? <>The conversation<br />finds its rhythm</> : <>La charla<br />agarra ritmo</>}</span></div>
      </div>
      <div className="timeline-head"><span>{english ? 'MOMENT SELECTION' : 'SELECCIÓN DE MOMENTOS'}</span><span>01:32:18</span></div>
      <div className="wave-track" aria-hidden="true">
        <div className="wave-bars">{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
        <div className="wave-playhead"><span /></div>
        {moments.map((moment, index) => <motion.div className={`moment-marker moment-marker--${moment.tint}`} key={moment.at} style={{ left: `${7 + index * 21}%` }} animate={reduceMotion ? undefined : { opacity: [0.35,1,1,0.55], scale: [0.92,1,1,0.96] }} transition={reduceMotion ? undefined : { duration: 12, delay: index * 0.9, repeat: Infinity, ease: 'linear' }}><span className="moment-marker__stem" /><span className="moment-marker__score">{moment.score}</span></motion.div>)}
      </div>
      <div className="wave-labels"><span>00:00</span><span>00:30</span><span>01:00</span><span>01:32</span></div>
      <div className="clip-strip">{moments.map((moment,index) => <motion.div className={`clip-peek clip-peek--${moment.tint}`} key={moment.at} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: [0,1,1,0.72], y: [12,0,0,2] }} transition={reduceMotion ? undefined : { duration: 12, delay: index * 0.9, repeat: Infinity, ease: 'linear' }}><div className="clip-peek__portrait"><i /><b /><em /></div><span className="clip-peek__score">{moment.score}</span><span className="clip-peek__time">{moment.at}</span><span className="clip-peek__title">{moment.title}</span></motion.div>)}</div>
    </div>
  );
}

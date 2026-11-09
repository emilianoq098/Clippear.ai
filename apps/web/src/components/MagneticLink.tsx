'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';

type Props = { href: string; children: ReactNode; className?: string; tone?: 'primary' | 'quiet' };

export default function MagneticLink({ href, children, tone = 'primary', className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.2 });
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.2 });
  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    rawY.set((event.clientY - rect.top - rect.height / 2) * 0.12);
  };

  return (
    <motion.a
      href={href}
      className={`magnetic-link magnetic-link--${tone} ${className}`}
      style={reduceMotion ? undefined : { x, y }}
      onPointerMove={move}
      onPointerLeave={() => { rawX.set(0); rawY.set(0); }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >{children}</motion.a>
  );
}

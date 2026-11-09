'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function PointerFollower() {
  const [visible, setVisible] = useState(false);
  const pointerX = useMotionValue(-20);
  const pointerY = useMotionValue(-20);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.body.classList.add('has-custom-cursor');
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      setVisible(true);
    };
    const leave = (event: MouseEvent) => {
      if (!event.relatedTarget) setVisible(false);
    };
    const blur = () => setVisible(false);

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('mouseout', leave);
    window.addEventListener('blur', blur);
    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('mouseout', leave);
      window.removeEventListener('blur', blur);
    };
  }, [pointerX, pointerY]);

  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-follower${visible ? ' pointer-follower--visible' : ''}`}
      style={{ x: pointerX, y: pointerY }}
    />
  );
}

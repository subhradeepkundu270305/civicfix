'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;        // enable 3-D tilt on hover
  lift?: boolean;        // enable lift-shadow on hover
  delay?: number;        // stagger delay for fade-in
  onClick?: () => void;
}

export default function AnimatedCard({
  children,
  className = '',
  tilt = false,
  lift = true,
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Raw motion values for mouse position (–0.5 → 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springy interpolation for buttery smooth tilt
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      whileHover={lift ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${className} ${tilt ? 'transform-gpu' : ''}`}
    >
      {children}
    </motion.div>
  );
}

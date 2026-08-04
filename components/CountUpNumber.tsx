'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate, useInView } from 'framer-motion';

interface CountUpNumberProps {
  end: number;
  duration?: number;  // ms or seconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUpNumber({
  end,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: '0px' });

  // Convert duration to seconds if provided in milliseconds
  const durationInSeconds = duration > 20 ? duration / 1000 : duration;

  const formattedValue = useTransform(count, (latest) => {
    const val = parseFloat(latest.toFixed(decimals));
    const formatted = val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, end, {
        duration: durationInSeconds,
        ease: [0.16, 1, 0.3, 1], // smooth framer-motion ease-out
      });
      return () => controls.stop();
    }
  }, [count, end, durationInSeconds, isInView]);

  useEffect(() => {
    const unsubscribe = formattedValue.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v;
      }
    });
    return () => unsubscribe();
  }, [formattedValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}


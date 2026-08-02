'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpNumberProps {
  end: number;
  duration?: number;  // ms
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUpNumber({
  end,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CountUpNumberProps) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  useEffect(() => {
    startTime.current = null;
    const startVal = display;
    const targetVal = end;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (startVal === targetVal) {
      setDisplay(targetVal);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const val = startVal + easedProgress * (targetVal - startVal);
      setDisplay(parseFloat(val.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(targetVal);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration, decimals]);

  return (
    <span className={className}>
      {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

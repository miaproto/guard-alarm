import React, { useEffect, useState } from 'react';
import { formatDuration } from '../../utils';

export function LiveDuration({ startTime }: { startTime: Date }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calc = () => Math.floor((Date.now() - startTime.getTime()) / 1000);
    setSeconds(calc());
    const interval = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 text-emerald-600 font-bold animate-pulse">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span className="font-mono">{formatDuration(seconds)}</span>
    </div>
  );
}



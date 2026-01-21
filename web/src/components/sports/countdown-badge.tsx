'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
  startDate: number; // Unix timestamp in seconds
  className?: string;
}

export function CountdownBadge({ startDate, className }: CountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = startDate - now;

      if (diff <= 0) {
        setTimeLeft('Starting...');
        setIsStarting(true);
        return;
      }

      setIsStarting(false);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m`);
      } else {
        setTimeLeft('< 1m');
        setIsStarting(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [startDate]);

  if (!timeLeft) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded',
        isStarting
          ? 'bg-green-500/90 text-white animate-pulse'
          : 'bg-yellow-500/90 text-black',
        className
      )}
    >
      <Clock className="w-3 h-3" />
      <span>{timeLeft}</span>
    </div>
  );
}

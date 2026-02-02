'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/lib/ui/badge';
import { RadioIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected?: boolean;
  className?: string;
}

export function RealtimeIndicator({ isConnected: propIsConnected, className }: RealtimeIndicatorProps) {
  const [isConnected, setIsConnected] = useState(propIsConnected ?? false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (propIsConnected !== undefined) {
      setIsConnected(propIsConnected);
      setLastUpdated(new Date());
      return;
    }

    // Only use simulation if no prop is provided
    const connectionCheck = setInterval(() => {
      // In a real app, this would check the actual Supabase realtime connection
      const random = Math.random();
      const connected = random > 0.1; // 90% chance of being connected
      setIsConnected(connected);
      setLastUpdated(new Date());
    }, 5000);

    return () => {
      clearInterval(connectionCheck);
    };
  }, [propIsConnected]);

  if (!isConnected) {
    return (
      <div className={className}>
        <Badge variant="destructive" className="flex items-center gap-2">
          <AlertCircleIcon className="w-3 h-3" />
          Realtime disconnected
        </Badge>
      </div>
    );
  }

  return (
    <div className={className}>
      <Badge variant="secondary" className="flex items-center gap-2">
        <RadioIcon className="w-3 h-3 animate-pulse" />
        <span>Live updates</span>
        {lastUpdated && (
          <span className="text-xs opacity-70">
            · Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </Badge>
    </div>
  );
}
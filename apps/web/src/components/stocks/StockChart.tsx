'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/card';
import { StockHistoricalData } from '@/types/stocks';
import { stockAPI } from '@/lib/stocks/api';
import { Button } from '@/lib/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/ui/select';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  height?: number;
  showControls?: boolean;
}

type Timeframe = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export function StockChart({ symbol, height = 300, showControls = true }: StockChartProps) {
  const [historicalData, setHistoricalData] = useState<StockHistoricalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [error, setError] = useState<string | null>(null);

  // Map timeframe to days
  const timeframeToDays: Record<Timeframe, number> = {
    '1d': 1,
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const days = timeframeToDays[timeframe];
      const data = await stockAPI.getHistoricalData(symbol, days);
      setHistoricalData(data);
    } catch (err) {
      setError('Failed to load historical data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol, timeframe]);

  // Calculate chart metrics
  const chartData = useMemo(() => {
    if (!historicalData) return null;

    const data = historicalData.data;
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Normalize data for chart
    const normalizedData = data.map(d => ({
      ...d,
      normalizedPrice: ((d.close - minPrice) / priceRange) * 100,
    }));

    return {
      normalizedData,
      minPrice,
      maxPrice,
      currentPrice: data[data.length - 1]?.close || 0,
      previousPrice: data[data.length - 2]?.close || data[data.length - 1]?.close || 0,
      priceChange: (data[data.length - 1]?.close || 0) - (data[data.length - 2]?.close || data[data.length - 1]?.close || 0),
      priceChangePercent: ((data[data.length - 1]?.close || 0) - (data[data.length - 2]?.close || data[data.length - 1]?.close || 0)) / (data[data.length - 2]?.close || data[data.length - 1]?.close || 1) * 100,
    };
  }, [historicalData]);

  // Render the chart
  const renderChart = () => {
    if (!chartData) return null;

    const { normalizedData, minPrice, maxPrice } = chartData;
    const width = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate points
    const points = normalizedData.map((d, i) => {
      const x = padding + (i / (normalizedData.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.normalizedPrice / 100) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    // Create gradient for the fill
    const gradientId = `gradient-${symbol}`;
    const lineGradientId = `line-gradient-${symbol}`;

    return (
      <div className="relative w-full" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1={padding}
                y1={padding + ratio * chartHeight}
                x2={padding + chartWidth}
                y2={padding + ratio * chartHeight}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
              <text
                x={padding - 10}
                y={padding + ratio * chartHeight + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                ${(maxPrice - ratio * (maxPrice - minPrice)).toFixed(2)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d={`M ${points} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`}
            fill={`url(#${gradientId})`}
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {normalizedData.map((d, i) => {
            if (i % Math.ceil(normalizedData.length / 10) === 0 || i === normalizedData.length - 1) {
              const x = padding + (i / (normalizedData.length - 1)) * chartWidth;
              const y = padding + chartHeight - (d.normalizedPrice / 100) * chartHeight;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="hsl(var(--primary))"
                    className="hover:r-5 transition-all"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    {i === normalizedData.length - 1 ? d.close.toFixed(2) : ''}
                  </text>
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  const changeColor = chartData?.priceChange >= 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = chartData?.priceChange > 0
    ? <TrendingUp className="h-4 w-4" />
    : chartData?.priceChange < 0
      ? <TrendingDown className="h-4 w-4" />
      : <Minus className="h-4 w-4" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {symbol} Chart
          </CardTitle>
          {chartData && (
            <div className="flex items-center space-x-2">
              {changeIcon}
              <span className={`${changeColor} font-medium`}>
                ${chartData.currentPrice.toFixed(2)}
              </span>
              <span className={`${changeColor} text-sm`}>
                ({chartData.priceChange >= 0 ? '+' : ''}{chartData.priceChange.toFixed(2)}
                ({chartData.priceChangePercent.toFixed(2)}%))
              </span>
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={(value: Timeframe) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground" style={{ height }}>
            {error}
          </div>
        ) : chartData ? (
          <div>
            {renderChart()}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">High</div>
                <div className="font-medium">${maxPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Low</div>
                <div className="font-medium">${minPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground" style={{ height }}>
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { StockSymbol, StockPrice } from '@/types/stocks';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/card';
import { Badge } from '@/lib/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockCardProps {
  stock: StockSymbol | StockPrice;
  showChart?: boolean;
  className?: string;
}

export function StockCard({ stock, showChart = false, className = '' }: StockCardProps) {
  const isStockPrice = 'timestamp' in stock;
  const changeColor = stock.change >= 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = stock.change > 0
    ? <TrendingUp className="h-4 w-4" />
    : stock.change < 0
      ? <TrendingDown className="h-4 w-4" />
      : <Minus className="h-4 w-4" />;

  const formattedPrice = stock.price.toFixed(2);
  const formattedChange = stock.change.toFixed(2);
  const formattedChangePercent = Math.abs(stock.changePercent).toFixed(2);

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {stock.symbol}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isStockPrice && 'name' in stock ? stock.name : ''}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {changeIcon}
            <Badge
              variant={stock.change >= 0 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {stock.change >= 0 ? '+' : ''}{formattedChange} ({stock.change >= 0 ? '+' : ''}{formattedChangePercent}%)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">
              ${formattedPrice}
            </div>
            {isStockPrice && 'volume' in stock && (
              <div className="text-sm text-muted-foreground mt-1">
                Volume: {(stock.volume / 1000000).toFixed(1)}M
              </div>
            )}
          </div>

          {showChart && (
            <div className="w-24 h-12 bg-muted rounded flex items-end justify-center space-x-1">
              {/* Simple chart visualization */}
              {[0.8, 0.6, 0.7, 0.9, 1, 0.85, 0.95].map((height, index) => (
                <div
                  key={index}
                  className="w-2 bg-blue-500 rounded-t"
                  style={{ height: `${height * 30}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {isStockPrice && 'timestamp' in stock && (
          <div className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(stock.timestamp).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
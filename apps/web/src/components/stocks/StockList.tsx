'use client';

import { useState, useEffect, useMemo } from 'react';
import { StockSymbol } from '@/types/stocks';
import { StockCard } from './StockCard';
import { Input } from '@/lib/ui/input';
import { Button } from '@/lib/ui/button';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { stockAPI } from '@/lib/stocks/api';

interface StockListProps {
  stocks?: StockSymbol[];
  onSelect?: (stock: StockSymbol) => void;
  showChart?: boolean;
}

export function StockList({ stocks: initialStocks, onSelect, showChart = false }: StockListProps) {
  const [stocks, setStocks] = useState<StockSymbol[]>(initialStocks || []);
  const [filteredStocks, setFilteredStocks] = useState<StockSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  // Load stocks if not provided
  useEffect(() => {
    if (!initialStocks) {
      loadStocks();
    }
  }, [initialStocks]);

  // Filter and search stocks
  useEffect(() => {
    let filtered = stocks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply gain/loser filter
    if (selectedFilter === 'gainers') {
      filtered = filtered.filter(stock => stock.change > 0).sort((a, b) => b.changePercent - a.changePercent);
    } else if (selectedFilter === 'losers') {
      filtered = filtered.filter(stock => stock.change < 0).sort((a, b) => a.changePercent - b.changePercent);
    } else {
      // Default sort: by market cap (mocked by price)
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredStocks(filtered);
  }, [stocks, searchQuery, selectedFilter]);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await stockAPI.getStocks();
      setStocks(data);
    } catch (error) {
      console.error('Failed to load stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStocks();
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      try {
        const results = await stockAPI.searchStocks(query);
        setFilteredStocks(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadStocks();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stocks by symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'gainers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('gainers')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Gainers
          </Button>
          <Button
            variant={selectedFilter === 'losers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('losers')}
          >
            <TrendingDown className="h-4 w-4 mr-1" />
            Losers
          </Button>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredStocks.length} of {stocks.length} stocks
      </div>

      {/* Stock grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-6 bg-muted-foreground/20 rounded w-1/2"></div>
                <div className="h-8 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => (
            <div key={stock.symbol} className="group">
              <StockCard
                stock={stock}
                showChart={showChart}
                className="cursor-pointer hover:shadow-xl transition-all duration-200"
              />
              {onSelect && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(stock)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No stocks found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
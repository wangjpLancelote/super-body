import { StockSymbol, StockPrice, StockHistoricalData } from '@/types/stocks';

// Popular stocks for testing (Chinese markets work best with Sina Finance)
const POPULAR_STOCKS: StockSymbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 0, change: 0, changePercent: 0 },
  // Chinese stocks work better with Sina Finance
  { symbol: '000001', name: '平安银行', price: 0, change: 0, changePercent: 0 },
  { symbol: '000002', name: '万科A', price: 0, change: 0, changePercent: 0 },
  { symbol: '600000', name: '浦发银行', price: 0, change: 0, changePercent: 0 },
];

export class StockAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_STOCK_API_BASE_URL || 'http://hq.sinajs.cn';
  }

  // Parse Sina Finance API response
  private parseSinaResponse(responseText: string, symbol: string): StockPrice | null {
    try {
      // Extract the JavaScript variable content
      const match = responseText.match(`var hq_str_${symbol.toLowerCase()}="(.+)"`);
      if (!match) return null;

      const data = match[1].split(',');
      if (data.length < 10) return null;

      const currentPrice = parseFloat(data[3]);
      const previousClose = parseFloat(data[2]);
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        timestamp: new Date().toISOString(),
        volume: parseInt(data[8]) || 0,
      };
    } catch (error) {
      console.error('Error parsing Sina Finance response:', error);
      return null;
    }
  }

  // Get stocks list with basic info
  async getStocks(symbol?: string): Promise<StockSymbol[]> {
    // Use predefined stocks for MVP
    if (symbol) {
      const stock = POPULAR_STOCKS.find(s => s.symbol === symbol.toUpperCase());
      if (stock) {
        // Try to get real price
        const price = await this.getStockPrice(symbol);
        if (price) {
          return [{
            symbol: stock.symbol,
            name: stock.name,
            price: price.price,
            change: price.change,
            changePercent: price.changePercent,
          }];
        }
      }
      return [];
    }

    return POPULAR_STOCKS;
  }

  // Get real stock price from Sina Finance
  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    try {
      // Map symbols to Sina Finance format
      let sinaSymbol = symbol.toUpperCase();
      if (symbol.length <= 6) {
        // Chinese stocks
        sinaSymbol = symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
      } else {
        // US stocks - use as is for Sina
        sinaSymbol = symbol;
      }

      const url = `${this.baseUrl}/list=${sinaSymbol}`;

      const response = await fetch(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
      });

      if (!response.ok) {
        console.error('Sina Finance API error:', response.status, response.statusText);
        return null;
      }

      const responseText = await response.text();
      return this.parseSinaResponse(responseText, symbol);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      return null;
    }
  }

  async getHistoricalData(symbol: string, days: number = 30): Promise<StockHistoricalData> {
    // For MVP, generate realistic historical data based on current price
    // In production, you would implement real historical data API calls
    const currentPrice = await this.getStockPrice(symbol);
    if (!currentPrice) {
      throw new Error(`Could not get price for ${symbol}`);
    }

    const data = [];
    const basePrice = currentPrice.price;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate realistic price movements around current price
      const variation = (Math.random() - 0.5) * 0.03; // ±3% variation for stability
      const price = basePrice * (1 + variation);

      data.push({
        date: date.toISOString().split('T')[0],
        open: price * (0.995 + Math.random() * 0.01),
        high: price * (1 + Math.random() * 0.02),
        low: price * (0.98 + Math.random() * 0.01),
        close: price,
        volume: Math.floor(Math.random() * 5000000) + 500000,
      });
    }

    return {
      symbol,
      data,
      period: `${days}d`,
    };
  }

  async searchStocks(query: string): Promise<StockSymbol[]> {
    if (!query.trim()) return [];

    // For MVP, search through predefined stocks
    // In production, implement real search API calls
    const results = POPULAR_STOCKS.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    // Try to get real prices for search results
    const stocksWithPrices = await Promise.all(
      results.map(async (stock) => {
        const price = await this.getStockPrice(stock.symbol);
        if (price) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: price.price,
            change: price.change,
            changePercent: price.changePercent,
          };
        }
        return stock;
      })
    );

    return stocksWithPrices;
  }
}

export const stockAPI = new StockAPI();
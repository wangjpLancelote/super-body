export type StockSymbol = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume: number;
};

const POPULAR_STOCKS: StockSymbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 0, change: 0, changePercent: 0 },
  { symbol: '000001', name: '平安银行', price: 0, change: 0, changePercent: 0 },
  { symbol: '000002', name: '万科A', price: 0, change: 0, changePercent: 0 },
  { symbol: '600000', name: '浦发银行', price: 0, change: 0, changePercent: 0 },
];

export class StockAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_STOCK_API_BASE_URL || 'http://hq.sinajs.cn';
  }

  private parseSinaResponse(responseText: string, symbol: string): StockPrice | null {
    try {
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
        change,
        changePercent,
        timestamp: new Date().toISOString(),
        volume: parseInt(data[8]) || 0,
      };
    } catch (error) {
      console.warn('Error parsing Sina Finance response:', error);
      return null;
    }
  }

  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    try {
      let sinaSymbol = symbol.toUpperCase();
      if (symbol.length <= 6) {
        sinaSymbol = symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
      }

      const url = `${this.baseUrl}/list=${sinaSymbol}`;

      const response = await fetch(url, {
        headers: {
          Referer: 'https://finance.sina.com.cn',
        },
      });

      if (!response.ok) {
        console.warn('Sina Finance API error:', response.status, response.statusText);
        return null;
      }

      const responseText = await response.text();
      return this.parseSinaResponse(responseText, symbol);
    } catch (error) {
      console.warn('Error fetching stock price:', error);
      return null;
    }
  }

  async getStocks(): Promise<StockSymbol[]> {
    const prices = await Promise.all(
      POPULAR_STOCKS.map(async (stock) => {
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

    return prices;
  }

  async searchStocks(query: string): Promise<StockSymbol[]> {
    if (!query.trim()) return [];

    const results = POPULAR_STOCKS.filter((stock) =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

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

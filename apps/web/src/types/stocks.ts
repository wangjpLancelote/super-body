export interface StockSymbol {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume: number;
}

export interface StockHistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WebSocketMessage {
  type: 'price_update' | 'error' | 'connection_status';
  data?: any;
  symbol?: string;
  message?: string;
}

export interface StockSubscription {
  symbol: string;
  callback: (data: StockPrice) => void;
}
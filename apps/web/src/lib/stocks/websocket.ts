import { WebSocketMessage, StockSubscription } from '@/types/stocks';

export class StockWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions: Map<string, StockSubscription[]> = new Map();
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private subscribedSymbols: Set<string> = new Set();

  constructor(private url: string = 'ws://localhost:3001/stocks') {}

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to stock WebSocket...');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        this.stopHeartbeat();

        // Attempt to reconnect if not closed by user
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'price_update':
        this.handlePriceUpdate(message);
        break;
      case 'connection_status':
        console.log('Connection status:', message.message);
        break;
      case 'error':
        console.error('WebSocket error:', message.message);
        break;
    }
  }

  // Start polling for real data when WebSocket fails
  private startPolling() {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      if (this.subscribedSymbols.size > 0) {
        for (const symbol of this.subscribedSymbols) {
          const subscriptions = this.subscriptions.get(symbol) || [];
          if (subscriptions.length > 0) {
            try {
              // Import stockAPI dynamically to avoid circular dependency
              const { stockAPI } = await import('./api');
              const price = await stockAPI.getStockPrice(symbol);

              if (price) {
                subscriptions.forEach(sub => {
                  sub.callback(price);
                });
              }
            } catch (error) {
              console.error(`Error polling price for ${symbol}:`, error);
            }
          }
        }
      }
    }, 5000); // Poll every 5 seconds
  }

  // Stop polling
  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private handlePriceUpdate(message: WebSocketMessage) {
    const symbol = message.symbol;
    const data = message.data;

    if (symbol && data) {
      const subscriptions = this.subscriptions.get(symbol) || [];
      subscriptions.forEach(sub => {
        sub.callback(data);
      });
    }
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
    }

    const subscriptions = this.subscriptions.get(symbol)!;
    subscriptions.push({ symbol, callback });

    // Add to subscribed symbols for polling
    this.subscribedSymbols.add(symbol);

    // Send subscription request if WebSocket is connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', symbol });
    } else {
      // If WebSocket is not connected, start polling
      this.startPolling();
      console.log(`WebSocket not connected, started polling for ${symbol}`);
    }

    console.log(`Subscribed to ${symbol}`);
  }

  unsubscribe(symbol: string, callback?: (data: any) => void) {
    const subscriptions = this.subscriptions.get(symbol);

    if (subscriptions) {
      if (callback) {
        // Remove specific callback
        const index = subscriptions.findIndex(sub => sub.callback === callback);
        if (index > -1) {
          subscriptions.splice(index, 1);
        }
      } else {
        // Remove all subscriptions for this symbol
        subscriptions.length = 0;
      }

      // Clean up empty subscription arrays
      if (subscriptions.length === 0) {
        this.subscriptions.delete(symbol);
        this.subscribedSymbols.delete(symbol);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.send({ type: 'unsubscribe', symbol });
        }
      }
    }

    // Stop polling if no subscriptions left
    if (this.subscribedSymbols.size === 0) {
      this.stopPolling();
    }

    console.log(`Unsubscribed from ${symbol}`);
  }

  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0; // Don't reconnect when manually disconnected
    if (this.ws) {
      this.ws.close(1000, 'User disconnect');
    }
    this.subscriptions.clear();
    this.subscribedSymbols.clear();
    this.stopHeartbeat();
    this.stopPolling();
  }

  getConnectionStatus() {
    if (!this.ws) return 'disconnected';
    return this.ws.readyState === WebSocket.OPEN ? 'connected' : 'connecting';
  }
}

// Singleton instance
export const stockWebSocket = new StockWebSocket();

// React hook for using WebSocket
export function useStockWebSocket() {
  return stockWebSocket;
}
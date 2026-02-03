# Stock API Integration

This document describes how to use the real stock API integration for the MVP.

## Overview

The stock integration has been updated to use real public APIs instead of mock data:

- **Primary API**: Sina Finance (`http://hq.sinajs.cn`) - Free and doesn't require authentication
- **Fallback**: Generated historical data based on real current prices
- **WebSocket**: Updated to poll real data when WebSocket is not available

## Environment Configuration

### Update root `.env` (single source):

```bash
# Use Sina Finance (Free, Chinese markets)
STOCK_API_BASE_URL=http://hq.sinajs.cn

# Optional: Use Alpha Vantage instead (requires API key)
# STOCK_API_KEY=your-alphavantage-api-key
# STOCK_API_BASE_URL=https://www.alphavantage.co/query
```

Then generate module env files:

```bash
bash scripts/sync-env.sh
```

### Stock Symbols

The system supports:
- **Chinese stocks**: Format like `000001` (平安银行), `600000` (浦发银行)
- **US stocks**: Format like `AAPL`, `GOOGL`, `TSLA`

## API Methods

### 1. `getStocks(symbol?)`
- Get list of popular stocks or specific stock
- Returns real prices when available

### 2. `getStockPrice(symbol)`
- Get real-time stock price
- Fetches from Sina Finance API

### 3. `getHistoricalData(symbol, days)`
- Generates realistic historical data based on current price
- In production, should be replaced with real historical data API

### 4. `searchStocks(query)`
- Search through popular stocks
- Returns real prices for matching stocks

## Testing

### Manual Testing

1. Start the development server:
```bash
npm run dev
```

2. Open the application and navigate to the stock features

3. Test with these symbols:
   - Chinese stocks: `000001`, `000002`, `600000`
   - US stocks: `AAPL`, `GOOGL`, `TSLA`

### Running the Test Script

```bash
node test-stock-api.js
```

## WebSocket Features

The WebSocket now includes:
- **Polling**: Automatically fetches real data every 5 seconds when WebSocket is not connected
- **Fallback**: Gracefully degrades to polling when WebSocket server is unavailable
- **Automatic cleanup**: Stops polling when no subscriptions remain

## Notes

1. **Sina Finance API**:
   - Free and doesn't require authentication
   - Works best with Chinese stocks
   - May have rate limits (don't spam requests)

2. **US Stocks**:
   - Sina Finance supports some US stocks but may be limited
   - Consider Alpha Vantage for better US stock coverage

3. **Error Handling**:
   - Gracefully falls back to mock data when APIs fail
   - Logs errors for debugging
   - Returns null for unavailable data

## Future Improvements

1. **Real Historical Data**: Implement historical data API calls
2. **Multiple API Sources**: Add Alpha Vantage, Yahoo Finance, etc.
3. **Rate Limiting**: Implement proper rate limiting for public APIs
4. **Caching**: Add caching to reduce API calls
5. **International Markets**: Add support for more markets

## Troubleshooting

1. **API Not Working**: Check network connectivity and CORS settings
2. **No Data**: Try Chinese stocks first (they work best with Sina Finance)
3. **WebSocket Issues**: The system automatically falls back to polling
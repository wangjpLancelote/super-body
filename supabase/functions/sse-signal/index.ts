import { corsHeaders, jsonResponse } from '../_shared/context.ts';
import { verifyAuth } from '../_shared/auth.ts';

type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume: number;
};

const DEFAULT_SYMBOLS = [
  'AAPL',
  'GOOGL',
  'MSFT',
  'TSLA',
  'NVDA',
  '000001',
  '000002',
  '600000',
];

function getTokenFromRequest(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  return token?.trim() || null;
}

function withAuthHeader(req: Request, token: string) {
  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return new Request(req, { headers });
}

function resolveSymbols(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get('symbols');
  if (!raw) return DEFAULT_SYMBOLS;
  const symbols = raw
    .split(',')
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  return symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;
}

function mapSinaSymbol(symbol: string) {
  if (symbol.length <= 6) {
    return symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
  }
  return symbol.toUpperCase();
}

function parseSinaResponse(responseText: string, symbol: string): StockPrice | null {
  try {
    const match = responseText.match(`var hq_str_${symbol.toLowerCase()}="(.+)"`);
    if (!match) return null;

    const data = match[1].split(',');
    if (data.length < 10) return null;

    const currentPrice = Number.parseFloat(data[3]);
    const previousClose = Number.parseFloat(data[2]);
    if (!Number.isFinite(currentPrice) || !Number.isFinite(previousClose)) return null;

    const change = currentPrice - previousClose;
    const changePercent = previousClose === 0 ? 0 : (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      volume: Number.parseInt(data[8], 10) || 0,
    };
  } catch {
    return null;
  }
}

async function fetchStockPrice(symbol: string): Promise<StockPrice | null> {
  const baseUrl = Deno.env.get('STOCK_API_BASE_URL') ?? 'http://hq.sinajs.cn';
  const sinaSymbol = mapSinaSymbol(symbol);
  const url = `${baseUrl}/list=${sinaSymbol}`;

  const response = await fetch(url, {
    headers: {
      Referer: 'https://finance.sina.com.cn',
    },
  });

  if (!response.ok) return null;
  const responseText = await response.text();
  return parseSinaResponse(responseText, symbol);
}

function buildSseMessage(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function streamStockUpdates(req: Request, userId: string) {
  const encoder = new TextEncoder();
  const symbols = resolveSymbols(req);
  let priceInterval: number | null = null;
  let heartbeatInterval: number | null = null;

  return new ReadableStream({
    start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(buildSseMessage(payload)));
      };

      send({
        type: 'connected',
        userId,
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      });

      priceInterval = setInterval(async () => {
        for (const symbol of symbols) {
          try {
            const price = await fetchStockPrice(symbol);
            if (!price) continue;
            send({
              type: 'stock_update',
              symbol: price.symbol,
              price: price.price.toFixed(2),
              payload: price,
              timestamp: price.timestamp,
              messageId: crypto.randomUUID(),
            });
          } catch (error) {
            send({
              type: 'error',
              payload: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
              messageId: crypto.randomUUID(),
            });
          }
        }
      }, 5000);

      heartbeatInterval = setInterval(() => {
        send({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          messageId: crypto.randomUUID(),
        });
      }, 30000);

      req.signal.addEventListener('abort', () => {
        if (priceInterval) clearInterval(priceInterval);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        controller.close();
      });
    },
    cancel() {
      if (priceInterval) clearInterval(priceInterval);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    let authRequest = req;
    const token = getTokenFromRequest(req);
    if (token) {
      authRequest = withAuthHeader(req, token);
    }

    const { user } = await verifyAuth(authRequest);
    const stream = await streamStockUpdates(req, user.id);

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 401);
  }
});

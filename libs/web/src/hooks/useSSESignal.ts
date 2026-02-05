import { useState, useEffect } from 'react'
import { SSESignalClient, SSESignalMessage } from '@/lib/realtime/sse-signal'

export interface SSESignalState {
  connected: boolean
  messageCount: number
  lastMessage: SSESignalMessage | null
  error: Error | null
}

type SSESignalOptions = {
  token: string;
  symbols?: string[];
};

function buildSSEUrl(baseUrl: string, token: string, symbols?: string[]) {
  const url = new URL(`${baseUrl}/functions/v1/sse-signal`);
  url.searchParams.set('token', token);
  if (symbols && symbols.length > 0) {
    url.searchParams.set('symbols', symbols.join(','));
  }
  return url.toString();
}

export function useSSESignal(options: string | SSESignalOptions) {
  const token = typeof options === 'string' ? options : options.token;
  const symbols = typeof options === 'string' ? undefined : options.symbols;
  const [state, setState] = useState<SSESignalState>({
    connected: false,
    messageCount: 0,
    lastMessage: null,
    error: null
  })

  const [client, setClient] = useState<SSESignalClient | null>(null)

  useEffect(() => {
    if (!token) return

    // 创建 SSE 客户端
    const sseClient = new SSESignalClient({
      url: buildSSEUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', token, symbols),
      token,
      onConnected: () => {
        setState(prev => ({ ...prev, connected: true, error: null }))
      },
      onDisconnected: () => {
        setState(prev => ({ ...prev, connected: false }))
      },
      onMessage: (message) => {
        setState(prev => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          lastMessage: message
        }))

        // 根据消息类型处理不同的业务逻辑
        handleMessage(message)
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error }))
      }
    })

    setClient(sseClient)
    sseClient.connect()

    // 清理函数
    return () => {
      sseClient.disconnect()
    }
  }, [token, symbols])

  // 处理不同类型的消息
  const handleMessage = (message: SSESignalMessage) => {
    switch (message.type) {
      case 'todo_update':
        // 触发 Todo 更新
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('todo-updated', {
            detail: message.payload
          }))
        }
        break

      case 'file_update':
        // 触发文件更新
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('file-updated', {
            detail: message.payload
          }))
        }
        break

      case 'stock_update':
        // 触发股票更新
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('stock-updated', {
            detail: {
              symbol: message.symbol,
              price: message.price
            }
          }))
        }
        break

      case 'heartbeat':
        // 心跳消息，用于维持连接
        break

      case 'error':
        // 错误处理
        console.error('SSE Error:', message.payload)
        break
    }
  }

  // 手动重连
  const reconnect = () => {
    if (client) {
      client.disconnect()
      setTimeout(() => client.connect(), 1000)
    }
  }

  // 订阅特定频道（用于兼容性）
  const subscribe = (channel: string, callback: (data: any) => void) => {
    if (client) {
      return client.subscribe(channel, callback)
    }
    return { unsubscribe: () => {} }
  }

  return {
    ...state,
    reconnect,
    subscribe
  }
}

// 预定义的订阅钩子
export function useTodoUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      console.log('Todo updated:', event.detail)
      // 这里可以添加具体的 UI 更新逻辑
    }

    if (connected) {
      window.addEventListener('todo-updated', handleUpdate as EventListener)
    }

    return () => {
      window.removeEventListener('todo-updated', handleUpdate as EventListener)
    }
  }, [connected])

  return { connected, lastMessage: lastMessage?.type === 'todo_update' ? lastMessage : null }
}

export function useFileUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      console.log('File updated:', event.detail)
      // 这里可以添加具体的 UI 更新逻辑
    }

    if (connected) {
      window.addEventListener('file-updated', handleUpdate as EventListener)
    }

    return () => {
      window.removeEventListener('file-updated', handleUpdate as EventListener)
    }
  }, [connected])

  return { connected, lastMessage: lastMessage?.type === 'file_update' ? lastMessage : null }
}

export function useStockUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      console.log('Stock updated:', event.detail)
      // 这里可以添加具体的 UI 更新逻辑
    }

    if (connected) {
      window.addEventListener('stock-updated', handleUpdate as EventListener)
    }

    return () => {
      window.removeEventListener('stock-updated', handleUpdate as EventListener)
    }
  }, [connected])

  return {
    connected,
    lastMessage: lastMessage?.type === 'stock_update' ? lastMessage : null,
    stockData: lastMessage?.type === 'stock_update' ? {
      symbol: lastMessage.symbol,
      price: lastMessage.price
    } : null
  }
}

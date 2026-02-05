import { useState, useEffect, useCallback } from 'react'
import { SSESignalClient, SSESignalMessage } from '../realtime/sse-signal'

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

  const createClient = useCallback(() => {
    if (!token) return

    const sseClient = new SSESignalClient({
      url: buildSSEUrl(process.env.EXPO_PUBLIC_SUPABASE_URL ?? '', token, symbols),
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

        handleMessage(message)
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error }))
      }
    })

    setClient(sseClient)
    sseClient.connect()
  }, [token, symbols])

  // 创建 SSE 客户端
  useEffect(() => {
    createClient()

    return () => {
      if (client) {
        client.disconnect()
      }
    }
  }, [createClient])

  // 处理不同类型的消息
  const handleMessage = useCallback((message: SSESignalMessage) => {
    switch (message.type) {
      case 'todo_update':
        // 触发 Todo 更新
        if (typeof global !== 'undefined') {
          // 使用 React Native 的 EventEmitter 或其他事件系统
          // 这里简化为 console.log
          console.log('Todo updated:', message.payload)
        }
        break

      case 'file_update':
        // 触发文件更新
        if (typeof global !== 'undefined') {
          console.log('File updated:', message.payload)
        }
        break

      case 'stock_update':
        // 触发股票更新
        if (typeof global !== 'undefined') {
          console.log('Stock updated:', {
            symbol: message.symbol,
            price: message.price
          })
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
  }, [])

  // 手动重连
  const reconnect = useCallback(() => {
    if (client) {
      client.disconnect()
      setTimeout(() => createClient(), 1000)
    }
  }, [client, createClient])

  // 订阅特定频道（用于兼容性）
  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    if (client) {
      return client.subscribe(channel, callback)
    }
    return { unsubscribe: () => {} }
  }, [client])

  // 检查网络连接状态（移动端特有）
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true)
      if (!client?.connected) {
        reconnect()
      }
    }

    const handleOffline = () => {
      setIsConnected(false)
    }

    // 监听网络状态变化
    const subscription = () => {
      // React Native 网络状态监听
      // 这里需要根据具体的 React Native 版本和网络库来实现
      // 示例代码：
      /*
      import { NetInfo } from 'react-native'

      NetInfo.addEventListener(state => {
        setIsConnected.isConnected)
      })
      */
    }

    return () => {
      // 清理网络监听
      subscription()
    }
  }, [client, reconnect])

  return {
    ...state,
    isConnected,
    reconnect,
    subscribe
  }
}

// 预定义的订阅钩子
export function useTodoUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage, isConnected } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (data: any) => {
      console.log('Todo updated:', data)
      // 这里可以添加具体的 UI 更新逻辑
      // 例如使用 React Native 的 Toast 或其他 UI 组件
    }

    // 如果有 React Native 的事件系统，可以使用：
    // eventEmitter.addListener('todo-updated', handleUpdate)
    // 否则直接调用
    if (lastMessage?.type === 'todo_update') {
      handleUpdate(lastMessage.payload)
    }
  }, [connected, lastMessage, isConnected])

  return { connected, isConnected, lastMessage: lastMessage?.type === 'todo_update' ? lastMessage : null }
}

export function useFileUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage, isConnected } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (data: any) => {
      console.log('File updated:', data)
      // 这里可以添加具体的 UI 更新逻辑
    }

    if (lastMessage?.type === 'file_update') {
      handleUpdate(lastMessage.payload)
    }
  }, [connected, lastMessage, isConnected])

  return { connected, isConnected, lastMessage: lastMessage?.type === 'file_update' ? lastMessage : null }
}

export function useStockUpdates(options: string | SSESignalOptions) {
  const { connected, lastMessage, isConnected } = useSSESignal(options)

  useEffect(() => {
    const handleUpdate = (data: { symbol: string; price: string }) => {
      console.log('Stock updated:', data)
      // 这里可以添加具体的 UI 更新逻辑，例如更新股票列表
    }

    if (lastMessage?.type === 'stock_update') {
      handleUpdate({
        symbol: lastMessage.symbol!,
        price: lastMessage.price!
      })
    }
  }, [connected, lastMessage, isConnected])

  return {
    connected,
    isConnected,
    lastMessage: lastMessage?.type === 'stock_update' ? lastMessage : null,
    stockData: lastMessage?.type === 'stock_update' ? {
      symbol: lastMessage.symbol!,
      price: lastMessage.price!
    } : null
  }
}

// 移动端专用的连接状态 Hook
export function useConnectionState() {
  const [connectionType, setConnectionType] = useState<'wifi' | 'cellular' | 'none' | 'unknown'>('unknown')
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // 这里需要根据实际使用的网络库来实现
    // 示例代码：
    /*
    import { NetInfo } from 'react-native'

    const handleConnectionChange = (connectionState: any) => {
      setIsConnected(connectionState.isConnected)
      if (connectionState.type) {
        setConnectionType(connectionState.type)
      }
    }

    NetInfo.addEventListener(handleConnectionChange)

    return () => {
      NetInfo.removeEventListener(handleConnectionChange)
    }
    */
  }, [])

  return {
    connectionType,
    isConnected,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular'
  }
}

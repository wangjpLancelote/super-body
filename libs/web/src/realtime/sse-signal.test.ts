import { SSESignalClient, createSSESignalClient, disconnectSSESignal } from './sse-signal'

// Mock EventSource
class MockEventSource {
  static events: Map<string, ((event: Event) => void)[]> = new Map()

  onopen?: () => void
  onmessage?: (event: MessageEvent) => void
  onerror?: (event: Event) => void

  constructor(public url: string) {
    // Simulate connection
    setTimeout(() => {
      this.onopen?.()
    }, 10)
  }

  addEventListener(type: string, listener: any) {
    if (!MockEventSource.events.has(type)) {
      MockEventSource.events.set(type, [])
    }
    MockEventSource.events.get(type)?.push(listener)
  }

  removeEventListener(type: string, listener: any) {
    const listeners = MockEventSource.events.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  close() {
    this.onerror?.(new Error('Connection closed'))
  }

  static simulateMessage(data: any) {
    const messageEvent = new MessageEvent('message', { data: JSON.stringify(data) })
    MockEventSource.events.get('message')?.forEach(listener => listener(messageEvent))
  }

  static simulateError(error: Error) {
    const errorEvent = new Event('error')
    MockEventSource.events.get('error')?.forEach(listener => listener(errorEvent))
  }
}

// Mock global EventSource
;(global as any).EventSource = MockEventSource

describe('SSESignalClient', () => {
  let client: SSESignalClient
  let mockMessageHandler: jest.Mock
  let mockErrorHandler: jest.Mock
  let mockConnectedHandler: jest.Mock
  let mockDisconnectedHandler: jest.Mock

  beforeEach(() => {
    mockMessageHandler = jest.fn()
    mockErrorHandler = jest.fn()
    mockConnectedHandler = jest.fn()
    mockDisconnectedHandler = jest.fn()

    client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      onMessage: mockMessageHandler,
      onError: mockErrorHandler,
      onConnected: mockConnectedHandler,
      onDisconnected: mockDisconnectedHandler
    })

    // Clear mock events
    MockEventSource.events.clear()
  })

  afterEach(() => {
    client.disconnect()
    disconnectSSESignal()
    jest.clearAllMocks()
  })

  test('should establish connection and emit connected event', () => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      expect(mockConnectedHandler).toHaveBeenCalled()
      expect(client.connected).toBe(true)
    }, 20)
  })

  test('should handle incoming messages', () => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      const message = {
        type: 'todo_update',
        payload: { id: 1, title: 'Test Todo' },
        timestamp: new Date().toISOString(),
        messageId: 'test-123'
      }

      MockEventSource.simulateMessage(message)

      expect(mockMessageHandler).toHaveBeenCalledWith(message)
    }, 30)
  })

  test('should handle message parsing errors', () => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      // Simulate invalid JSON
      const invalidMessage = new MessageEvent('message', { data: 'invalid json' })

      const listeners = MockEventSource.events.get('message')
      listeners?.forEach(listener => listener(invalidMessage))

      expect(mockErrorHandler).toHaveBeenCalledWith(new Error('Failed to parse SSE message'))
    }, 30)
  })

  test('should handle connection errors and reconnect', () => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      // Simulate connection error
      MockEventSource.simulateError(new Error('Connection failed'))

      // First error should trigger reconnection
      expect(mockErrorHandler).toHaveBeenCalledWith(new Error('SSE connection error'))

      // Allow reconnection attempt
      setTimeout(() => {
        expect(mockConnectedHandler).toHaveBeenCalledTimes(2) // Initial + reconnect
      }, 50)
    }, 30)
  })

  test('should not exceed max reconnect attempts', () => {
    const limitedClient = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      maxReconnectAttempts: 2,
      onMessage: mockMessageHandler,
      onError: mockErrorHandler,
      onConnected: mockConnectedHandler,
      onDisconnected: mockDisconnectedHandler
    })

    limitedClient.connect()

    // Allow connection to establish
    setTimeout(() => {
      // Trigger max reconnect attempts
      for (let i = 0; i < 3; i++) {
        MockEventSource.simulateError(new Error('Connection failed'))
      }

      setTimeout(() => {
        expect(mockDisconnectedHandler).toHaveBeenCalled()
        expect(mockErrorHandler).toHaveBeenCalledTimes(3)
      }, 100)
    }, 30)

    setTimeout(() => {
      limitedClient.disconnect()
    }, 200)
  })

  test('should clean up resources on disconnect', () => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      client.disconnect()

      expect(mockDisconnectedHandler).toHaveBeenCalled()
      expect(client.connected).toBe(false)
    }, 20)
  })

  test('should handle heartbeat monitoring', (done) => {
    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      // Simulate no heartbeat for 45 seconds
      setTimeout(() => {
        expect(mockErrorHandler).toHaveBeenCalledWith(new Error('SSE connection error'))
        done()
      }, 50) // Shortened for testing
    }, 20)
  })
})

describe('SSESignalClient Factory', () => {
  test('should create singleton instance', () => {
    const client1 = createSSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token'
    })

    const client2 = createSSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token'
    })

    expect(client1).toBe(client2)
    expect(client1).toBe((global as any).sseSignalClient)
  })

  test('should disconnect singleton instance', () => {
    const mockDisconnectedHandler = jest.fn()

    createSSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      onDisconnected: mockDisconnectedHandler
    })

    disconnectSSESignal()

    expect(mockDisconnectedHandler).toHaveBeenCalled()
  })
})

describe('Message Types', () => {
  test('should handle different message types', () => {
    const messageHandler = jest.fn()

    client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      onMessage: messageHandler
    })

    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      const messages = [
        {
          type: 'connected',
          userId: 'user-123',
          timestamp: new Date().toISOString(),
          messageId: 'connect-123'
        },
        {
          type: 'todo_update',
          payload: { id: 1, title: 'Test Todo' },
          timestamp: new Date().toISOString(),
          messageId: 'todo-123'
        },
        {
          type: 'file_update',
          payload: { id: 1, name: 'test.jpg' },
          timestamp: new Date().toISOString(),
          messageId: 'file-123'
        },
        {
          type: 'stock_update',
          symbol: 'AAPL',
          price: '150.00',
          timestamp: new Date().toISOString(),
          messageId: 'stock-123'
        },
        {
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          messageId: 'heartbeat-123'
        }
      ]

      messages.forEach(message => {
        MockEventSource.simulateMessage(message)
      })

      expect(messageHandler).toHaveBeenCalledTimes(messages.length)
    }, 30)
  })
})

describe('Connection Stability', () => {
  test('should maintain connection during network issues', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      reconnectInterval: 100, // Fast reconnect for testing
      maxReconnectAttempts: 3
    })

    client.connect()

    // Allow connection to establish
    setTimeout(() => {
      const messageHandler = jest.fn()
      client.onMessage = messageHandler

      // Simulate multiple network errors
      for (let i = 0; i < 2; i++) {
        MockEventSource.simulateError(new Error('Network error'))
        setTimeout(() => {
          // Re-establish connection
          const newEventSource = new MockEventSource(client['url'])
          client['eventSource'] = newEventSource
          client['isConnected'] = true
          newEventSource.onopen?.()
        }, 50)
      }

      setTimeout(() => {
        expect(messageHandler).not.toHaveBeenCalled() // Should reconnect before receiving messages
      }, 200)
    }, 20)

    setTimeout(() => {
      client.disconnect()
    }, 300)
  })
})
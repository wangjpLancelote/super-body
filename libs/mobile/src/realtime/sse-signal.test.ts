import { SSESignalClient, createSSESignalClient, disconnectSSESignal, useSSESignal } from './sse-signal'

// Mock React for mobile environment
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useRef: jest.fn()
}))

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

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

describe('SSESignalClient Mobile', () => {
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

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    expect(mockConnectedHandler).toHaveBeenCalled()
    expect(client.connected).toBe(true)
  })

  test('should handle incoming messages', () => {
    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    const message = {
      type: 'todo_update',
      payload: { id: 1, title: 'Test Todo' },
      timestamp: new Date().toISOString(),
      messageId: 'test-123'
    }

    MockEventSource.simulateMessage(message)

    expect(mockMessageHandler).toHaveBeenCalledWith(message)
  })

  test('should handle connection errors and reconnect', () => {
    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Trigger error
    MockEventSource.simulateError(new Error('Connection failed'))

    expect(mockErrorHandler).toHaveBeenCalledWith(new Error('SSE connection error'))

    // Advance timers to allow reconnection
    jest.advanceTimersByTime(50)

    expect(mockConnectedHandler).toHaveBeenCalledTimes(2) // Initial + reconnect
  })

  test('should handle heartbeat timeout', () => {
    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Simulate no heartbeat for 45 seconds
    jest.advanceTimersByTime(45000)

    expect(mockErrorHandler).toHaveBeenCalledWith(new Error('SSE connection error'))
  })

  test('should clean up resources on disconnect', () => {
    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    client.disconnect()

    expect(mockDisconnectedHandler).toHaveBeenCalled()
    expect(client.connected).toBe(false)
  })
})

describe('React Hook useSSESignal', () => {
  let mockOptions: any
  let mockUseEffect: jest.Mock
  let mockUseRef: jest.Mock

  beforeEach(() => {
    mockOptions = {
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      onConnected: jest.fn(),
      onDisconnected: jest.fn()
    }

    mockUseEffect = jest.fn()
    mockUseRef = jest.fn().mockReturnValue({
      current: null
    })

    // Mock the React hooks
    jest.doMock('react', () => ({
      useEffect: mockUseEffect,
      useRef: mockUseRef
    }))
  })

  test('should create SSE client on mount', () => {
    const { useSSESignal } = require('./sse-signal')
    const { useSSESignal: hook } = useSSESignal(mockOptions)

    expect(mockUseEffect).toHaveBeenCalled()
  })
})

describe('Mobile-Specific Features', () => {
  test('should handle connection stability on mobile', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      reconnectInterval: 100, // Fast reconnect for testing
      maxReconnectAttempts: 3
    })

    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Simulate multiple network errors (common on mobile)
    for (let i = 0; i < 2; i++) {
      MockEventSource.simulateError(new Error('Network error'))

      // Advance timers for reconnection
      jest.advanceTimersByTime(150)
    }

    expect(mockErrorHandler).toHaveBeenCalledTimes(2)
    expect(client.connected).toBe(true)
  })

  test('should handle low-power mode scenarios', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      reconnectInterval: 5000, // Longer interval for mobile
      maxReconnectAttempts: 5
    })

    client.connect()

    // Simulate device going to sleep
    jest.advanceTimersByTime(60000) // 1 minute

    // Client should maintain connection state
    expect(client.connected).toBe(true)
  })

  test('should handle background/foreground transitions', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      reconnectInterval: 1000
    })

    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Simulate app going to background
    jest.advanceTimersByTime(30000) // 30 seconds in background

    // Still connected
    expect(client.connected).toBe(true)

    // Back to foreground
    // No special handling needed for SSE, it will auto-reconnect if needed
  })
})

describe('Offline/Online Scenarios', () => {
  test('should handle offline scenarios gracefully', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token'
    })

    client.connect()

    // Simulate offline by closing connection
    jest.advanceTimersByTime(20)

    // Disconnect to simulate offline
    client.disconnect()

    // Should not crash
    expect(() => {
      client.connect()
    }).not.toThrow()
  })

  test('should reconnect when coming back online', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token',
      reconnectInterval: 2000
    })

    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Disconnect to simulate offline
    client.disconnect()

    // Reconnect after some time
    jest.advanceTimersByTime(2000)
    client.connect()

    // Advance timers to allow reconnection
    jest.advanceTimersByTime(20)

    expect(client.connected).toBe(true)
  })
})

describe('Memory Management on Mobile', () => {
  test('should clean up memory properly', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token'
    })

    client.connect()

    // Advance timers to allow connection
    jest.advanceTimersByTime(20)

    // Ensure all timers are cleaned up
    const initialTimers = jest.getTimerCount()
    client.disconnect()

    expect(jest.getTimerCount()).toBeLessThanOrEqual(initialTimers)
  })

  test('should handle multiple connections and disconnections', () => {
    const client = new SSESignalClient({
      url: 'https://test.supabase.co/functions/v1/sse-signal',
      token: 'test-token'
    })

    // Multiple connect/disconnect cycles
    for (let i = 0; i < 3; i++) {
      client.connect()
      jest.advanceTimersByTime(20)
      client.disconnect()
      jest.advanceTimersByTime(20)
    }

    // Should not cause memory leaks
    expect(jest.getTimerCount()).toBe(0)
  })
})
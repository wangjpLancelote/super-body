export interface SSESignalMessage {
  type: 'connected' | 'todo_update' | 'file_update' | 'stock_update' | 'heartbeat' | 'error'
  payload?: any
  userId?: string
  timestamp: string
  messageId: string
  symbol?: string
  price?: string
}

export interface SSESignalOptions {
  url: string
  token: string
  onMessage?: (message: SSESignalMessage) => void
  onError?: (error: Error) => void
  onConnected?: () => void
  onDisconnected?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export class SSESignalClient {
  private url: string
  private token: string
  private onMessage?: (message: SSESignalMessage) => void
  private onError?: (error: Error) => void
  private onConnected?: () => void
  private onDisconnected?: () => void
  private reconnectInterval: number
  private maxReconnectAttempts: number
  private reconnectAttempts: number = 0
  private eventSource: EventSource | null = null
  private isConnected: boolean = false
  private reconnectTimer: any = null
  private heartbeatTimer: any = null
  private lastMessageTime: number = 0
  private pingTimeout: any = null

  constructor(options: SSESignalOptions) {
    this.url = options.url
    this.token = options.token
    this.onMessage = options.onMessage
    this.onError = options.onError
    this.onConnected = options.onConnected
    this.onDisconnected = options.onDisconnected
    this.reconnectInterval = options.reconnectInterval || 3000
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10
  }

  connect() {
    if (this.isConnected) return

    try {
      // Add authentication header
      const urlWithAuth = `${this.url}?token=${encodeURIComponent(this.token)}`

      this.eventSource = new EventSource(urlWithAuth)

      this.eventSource.onopen = () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        this.lastMessageTime = Date.now()
        console.log('SSE-Signal connection established')

        if (this.onConnected) {
          this.onConnected()
        }

        // Start heartbeat monitoring
        this.startHeartbeatMonitor()
      }

      this.eventSource.onmessage = (event) => {
        try {
          const message: SSESignalMessage = JSON.parse(event.data)
          this.lastMessageTime = Date.now()

          if (this.onMessage) {
            this.onMessage(message)
          }

          // Reset ping timeout on message receipt
          if (this.pingTimeout) {
            clearTimeout(this.pingTimeout)
            this.pingTimeout = null
          }

          console.log('SSE-Signal message received:', message.type)
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
          if (this.onError) {
            this.onError(error as Error)
          }
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('SSE-Signal error:', error)

        // Clean up connection
        this.cleanup()

        if (this.onError) {
          this.onError(new Error('SSE connection error'))
        }

        // Attempt to reconnect if under max attempts
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`SSE-Signal reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

          this.reconnectTimer = setTimeout(() => {
            this.connect()
          }, this.reconnectInterval)
        } else {
          console.error('SSE-Signal max reconnect attempts reached')
          if (this.onDisconnected) {
            this.onDisconnected()
          }
        }
      }

    } catch (error) {
      console.error('Failed to establish SSE connection:', error)
      if (this.onError) {
        this.onError(error as Error)
      }
    }
  }

  disconnect() {
    this.cleanup()
    console.log('SSE-Signal connection disconnected')
    if (this.onDisconnected) {
      this.onDisconnected()
    }
  }

  private cleanup() {
    this.isConnected = false

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
  }

  private startHeartbeatMonitor() {
    // Check for heartbeat every 30 seconds
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now()
      const timeSinceLastMessage = now - this.lastMessageTime

      // If no message for 45 seconds (heartbeat is every 30), consider connection dead
      if (timeSinceLastMessage > 45000) {
        console.warn('SSE-Signal connection timeout, reconnecting...')
        this.cleanup()
        this.connect()
        return
      }

      // Send ping to keep connection alive
      this.pingTimeout = setTimeout(() => {
        if (this.isConnected) {
          console.log('SSE-Signal ping timeout, reconnecting...')
          this.cleanup()
          this.connect()
        }
      }, 30000)
    }, 30000)
  }

  subscribe(channel: string, callback: (data: any) => void) {
    // For SSE-Signal, we handle subscriptions server-side
    // This method is kept for compatibility with other realtime systems
    console.log(`SSE-Signal subscription to ${channel} handled server-side`)
    return { unsubscribe: () => {} }
  }

  get connected() {
    return this.isConnected
  }
}

// React Hook for SSE-Signal
import { useEffect, useRef } from 'react'

export function useSSESignal(options: SSESignalOptions) {
  const clientRef = useRef<SSESignalClient | null>(null)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new SSESignalClient(options)
      clientRef.current.connect()
    }

    // Update connection state
    const updateConnectionState = () => {
      isConnectedRef.current = clientRef.current?.connected || false
    }

    clientRef.current.onConnected = () => {
      options.onConnected?.()
      updateConnectionState()
    }

    clientRef.current.onDisconnected = () => {
      options.onDisconnected?.()
      updateConnectionState()
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [options])

  return {
    connected: isConnectedRef.current,
    client: clientRef.current,
    reconnect: () => clientRef.current?.connect(),
    disconnect: () => clientRef.current?.disconnect()
  }
}

// Create a singleton instance for the app
export let sseSignalClient: SSESignalClient | null = null

export function createSSESignalClient(options: SSESignalOptions): SSESignalClient {
  sseSignalClient = new SSESignalClient(options)
  return sseSignalClient
}

export function disconnectSSESignal() {
  if (sseSignalClient) {
    sseSignalClient.disconnect()
    sseSignalClient = null
  }
}
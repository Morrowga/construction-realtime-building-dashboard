// src/lib/websocket.ts
import type { WSEvent } from '@/types/api'

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000'

/**
 * Singleton WebSocket manager for the active project.
 * Reconnects with exponential backoff (1s → 30s max).
 */
class ProjectWebSocket {
  private ws: WebSocket | null = null
  private projectId: string | null = null
  private token: string | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0
  private intentionallyClosed = false
  private listeners: Set<(event: WSEvent) => void> = new Set()

  connect(projectId: string, token: string): void {
    // Already connected to this project — nothing to do.
    if (
      this.projectId === projectId &&
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    this.disconnect()
    this.projectId = projectId
    this.token = token
    this.intentionallyClosed = false
    this.open()
  }

  private open(): void {
    if (!this.projectId || !this.token) return
    try {
      this.ws = new WebSocket(`${WS_BASE}/ws/${this.projectId}?token=${this.token}`)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempt = 0
    }
    this.ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as WSEvent
        this.listeners.forEach((fn) => fn(event))
      } catch {
        // ignore malformed frames
      }
    }
    this.ws.onclose = () => {
      this.ws = null
      if (!this.intentionallyClosed) this.scheduleReconnect()
    }
    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30_000)
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.open()
    }, delay)
  }

  disconnect(): void {
    this.intentionallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempt = 0
    this.ws?.close()
    this.ws = null
    this.projectId = null
  }

  subscribe(listener: (event: WSEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const projectWS = new ProjectWebSocket()

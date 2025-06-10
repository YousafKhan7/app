/**
 * WebSocket hook for real-time data synchronization
 */
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useApiQueries';

interface WebSocketMessage {
  type: 'user_created' | 'user_updated' | 'user_deleted' | 
        'customer_created' | 'customer_updated' | 'customer_deleted' |
        'supplier_created' | 'supplier_updated' | 'supplier_deleted';
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = `ws://localhost:8000/ws`,
    enabled = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  const queryClient = useQueryClient();

  const connect = () => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`Scheduling reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  const handleMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    // Update React Query cache based on message type
    switch (message.type) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
        queryClient.invalidateQueries({ queryKey: queryKeys.activeUsersCount });
        break;
        
      case 'customer_created':
      case 'customer_updated':
      case 'customer_deleted':
        queryClient.invalidateQueries({ queryKey: queryKeys.customers });
        break;
        
      case 'supplier_created':
      case 'supplier_updated':
      case 'supplier_deleted':
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts
  };
};

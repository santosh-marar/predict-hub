import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface OrderBookData {
  bids: Array<{ price: number; quantity: number; userId?: string }>;
  asks: Array<{ price: number; quantity: number; userId?: string }>;
  lastUpdated?: number;
}

interface OrderBookUpdateData {
  eventId: string;
  orderBook: OrderBookData;
}

interface UseOrderBookReturn {
  socket: Socket | null;
  orderBookData: OrderBookData | null;
  isSubscribed: boolean;
  isConnected: boolean;
  error: string | null;
  subscribeToOrderBook: () => void;
  unsubscribeFromOrderBook: () => void;
  refreshOrderBook: () => void;
}

export function useOrderBook(
  eventId: string,
  userId: string,
): UseOrderBookReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(
    null,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080",
      {
        transports: ["websocket"],
        autoConnect: true,
      },
    );

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      newSocket.emit("subscribeToOrderBook", {
        eventId,
        userId,
      });
      setIsSubscribed(true);
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      setIsSubscribed(false);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Connection failed");
      setIsConnected(false);
    });

    newSocket.on("orderBookUpdate", (data: OrderBookUpdateData) => {
      if (data.eventId === eventId) {
        setOrderBookData(data.orderBook);
        setError(null);
      } else {
        console.warn(
          `Received update for incorrect eventId: ${data.eventId}, expected: ${eventId}`,
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [eventId, userId]);

  const subscribeToOrderBook = useCallback(() => {
    if (!socket || !socket.connected) {
      console.warn("Socket not connected, cannot subscribe");
      setError("Socket not connected");
      return;
    }

    if (isSubscribed) {
      return;
    }

    socket.emit("subscribeToOrderBook", {
      eventId,
      userId,
    });

    // Request initial order book data (if supported by server)
    socket.emit("requestOrderBook", {
      eventId,
      userId,
    });

    setIsSubscribed(true);
    setError(null);
  }, [socket, eventId, userId, isSubscribed]);

  const unsubscribeFromOrderBook = useCallback(() => {
    if (!socket) return;

    socket.emit("unsubscribeFromOrderBook", {
      eventId,
      userId,
    });

    setIsSubscribed(false);
    setOrderBookData(null);
  }, [socket, eventId, userId]);

  const refreshOrderBook = useCallback(() => {
    if (isSubscribed) {
      unsubscribeFromOrderBook();
      setTimeout(() => {
        subscribeToOrderBook();
      }, 100);
    }
  }, [isSubscribed, unsubscribeFromOrderBook, subscribeToOrderBook]);

  return {
    socket,
    orderBookData,
    isSubscribed,
    isConnected,
    error,
    subscribeToOrderBook,
    unsubscribeFromOrderBook,
    refreshOrderBook,
  };
}

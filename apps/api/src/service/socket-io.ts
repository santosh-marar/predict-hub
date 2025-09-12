import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { getOrderBook } from "@controllers/order";

// Types
interface ServerToClientEvents {
  pong: (data: { message: string; timestamp: number }) => void;
  orderBookUpdate: (data: {
    eventId: string;
    orderBook: any;
    timestamp: number;
  }) => void;
  subscriptionConfirmed: (data: {
    eventId: string;
    userId: string;
    timestamp: number;
  }) => void;
  subscriptionError: (data: { message: string; error?: string }) => void;
  connectionWelcome: (data: { socketId: string; timestamp: number }) => void;
}

interface ClientToServerEvents {
  ping: (data: { message: string }) => void;
  subscribeToOrderBook: (data: { eventId: string; userId: string }) => void;
  unsubscribeFromOrderBook: (data: { eventId: string; userId: string }) => void;
}

// For inter-server communication
interface InterServerEvents {
  orderBookChanged: (data: { eventId: string }) => void;
}

interface SocketData {
  userId?: string;
  subscribedEvents?: Set<string>;
  connectedAt?: number;
}

// Global state for managing connections
const orderBookSubscriptions = new Map<string, Set<string>>();
const userSockets = new Map<string, string>();
let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Initialize Socket.IO server
export const initializeSocket = (
  httpServer: HTTPServer,
): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
  });

  // Handle new connections
  io.on(
    "connection",
    (
      socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >,
    ) => {
      // Initialize socket data
      socket.data.subscribedEvents = new Set();
      socket.data.connectedAt = Date.now();

      // Send welcome message
      socket.emit("connectionWelcome", {
        socketId: socket.id,
        timestamp: Date.now(),
      });

      // Handle ping-pong for connection health monitoring
      socket.on("ping", (data) => {
        socket.emit("pong", {
          message: `Pong! Received: ${data.message}`,
          timestamp: Date.now(),
        });
      });

      // Enhanced order book subscription handler
      socket.on("subscribeToOrderBook", async (data) => {
        const { eventId, userId } = data;

        try {
          if (!eventId) {
            socket.emit("subscriptionError", {
              message: "eventId and userId are required",
              error: "MISSING_PARAMETERS",
            });
            return;
          }

          // Ensure socket data is initialized
          if (!socket.data.subscribedEvents) {
            socket.data.subscribedEvents = new Set();
          }

          // Add to socket tracking
          socket.data.subscribedEvents.add(eventId);
          socket.data.userId = userId;

          // Add to global subscription map
          if (!orderBookSubscriptions.has(eventId)) {
            orderBookSubscriptions.set(eventId, new Set());
          }
          orderBookSubscriptions.get(eventId)!.add(socket.id);

          // Join the event-specific room
          socket.join(`event_${eventId}`);

          // Store user ↔ socket mapping
          userSockets.set(userId, socket.id);

          // Confirm subscription
          socket.emit("subscriptionConfirmed", {
            eventId,
            userId,
            timestamp: Date.now(),
          });

          // Send latest order book
          try {
            const orderBook = await getOrderBook(eventId);
            socket.emit("orderBookUpdate", {
              eventId,
              orderBook,
              timestamp: Date.now(),
            });
          } catch (err) {
            socket.emit("subscriptionError", {
              message: "Failed to fetch order book",
              error: err instanceof Error ? err.message : "UNKNOWN_ERROR",
            });
          }
        } catch (error) {
          socket.emit("subscriptionError", {
            message: "Unexpected error during subscription",
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
          });
        }
      });

      // Handle unsubscription
      socket.on("unsubscribeFromOrderBook", (data) => {
        const { eventId, userId } = data;

        // Remove from global subscriptions
        if (orderBookSubscriptions.has(eventId)) {
          orderBookSubscriptions.get(eventId)!.delete(socket.id);

          // Clean up empty subscriptions
          if (orderBookSubscriptions.get(eventId)!.size === 0) {
            orderBookSubscriptions.delete(eventId);
          }
        }

        // Remove from socket-specific tracking
        if (socket.data.subscribedEvents) {
          socket.data.subscribedEvents.delete(eventId);
        }

        // Leave Socket.IO room
        socket.leave(`event_${eventId}`);
      });

      // Handle disconnection with comprehensive cleanup
      socket.on("disconnect", (reason) => {
        if (socket.data.userId) {
          userSockets.delete(socket.data.userId);
        }

        // Clean up order book subscriptions
        if (socket.data.subscribedEvents) {
          socket.data.subscribedEvents.forEach((eventId) => {
            if (orderBookSubscriptions.has(eventId)) {
              orderBookSubscriptions.get(eventId)!.delete(socket.id);

              // Clean up empty subscriptions
              if (orderBookSubscriptions.get(eventId)!.size === 0) {
                orderBookSubscriptions.delete(eventId);
              }
            }
          });
        }
      });

      socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    },
  );

  return io;
};

// Update order book subscriptions to all connected clients
export const broadcastOrderBookUpdate = async (eventId: string) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  try {
    const subscriberCount = orderBookSubscriptions.get(eventId)?.size || 0;
    if (subscriberCount === 0) {
      return;
    }

    const orderBook = await getOrderBook(eventId);

    io.to(`event_${eventId}`).emit("orderBookUpdate", {
      eventId,
      orderBook,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(
      `Failed to broadcast order book update for event ${eventId}:`,
      error,
    );
  }
};

// Emit to specific event room
export const emitToEvent = (
  eventId: string,
  event: keyof ServerToClientEvents,
  data: any,
) => {
  if (io) {
    io.to(`event_${eventId}`).emit(event, data);
  } else {
    console.error("Socket.IO not initialized");
  }
};

// Emit to all connected clients
export const emitToAll = (event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    io.emit(event, data);
  } else {
    console.error("Socket.IO not initialized");
  }
};

// Emit to specific user
export const emitToUser = (
  userId: string,
  event: keyof ServerToClientEvents,
  data: any,
) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

// Get connection statistics
export const getConnectionStats = () => {
  if (!io) return null;

  const stats = {
    totalConnections: io.sockets.sockets.size,
    totalSubscriptions: Array.from(orderBookSubscriptions.values()).reduce(
      (sum, sockets) => sum + sockets.size,
      0,
    ),
    eventSubscriptions: Array.from(orderBookSubscriptions.entries()).map(
      ([eventId, sockets]) => ({ eventId, subscriberCount: sockets.size }),
    ),
    connectedUsers: userSockets.size,
  };

  return stats;
};

// Utility function to call when order book changes
export const handleOrderBookChange = async (eventId: string) => {
  await broadcastOrderBookUpdate(eventId);
};

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};

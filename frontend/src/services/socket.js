import { io } from 'socket.io-client';

// Determine Socket.IO backend URL from environment or default
const rawUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api'
).trim().replace(/\/+$/, '');

// Strip /api if present to get the root server URL
const SOCKET_SERVER_URL = rawUrl.replace(/\/api\/?$/, '');

let socket = null;

/**
 * Initializes and returns the authenticated Socket.IO client connection
 */
export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // If socket is already connected with valid auth, reuse it
  if (socket && socket.connected) {
    return socket;
  }

  // Disconnect any stale disconnected instance
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket.IO client connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Socket.IO connection warning:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.IO disconnected:', reason);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => {
  if (!socket || !socket.connected) {
    return connectSocket();
  }
  return socket;
};

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
};


import dns from 'node:dns';

// Configure DNS for MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models for Socket.IO operations
import Message from './models/Message.js';
import Request from './models/Request.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SkillSwap API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (register, login, profile, users)',
      skills: '/api/skills (search, user, explore, create, update, delete)',
      requests: '/api/requests (sent, received, send, accept, reject, cancel)',
      chat: '/api/chat (conversations, messages)',
      health: '/api/health',
    },
  });
});

// Health check endpoint for cloud uptime monitors (Render, Railway, etc.)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

/* ============================================================
   SOCKET.IO REAL-TIME CHAT
============================================================ */

// JWT Authentication Middleware for Socket.IO
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return next(new Error('Authentication failed: Token is required for chat socket'));
    }

    const secret =
      process.env.JWT_SECRET || 'skillswap_dev_secret_key_change_in_production_2025';

    const decoded = jwt.verify(token, secret);
    socket.userId = decoded.id;

    next();
  } catch (err) {
    return next(new Error('Authentication failed: ' + err.message));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

  // Join personal room
  socket.join(`user_${socket.userId}`);

  // Join accepted exchange conversation
  socket.on('joinRoom', async ({ requestId }) => {
    try {
      if (!requestId) return;

      const request = await Request.findById(requestId);

      if (!request || request.status !== 'accepted') {
        socket.emit('error', {
          message: 'Cannot join room: Request must be accepted.',
        });
        return;
      }

      const isParticipant =
        request.senderId.toString() === socket.userId ||
        request.receiverId.toString() === socket.userId;

      if (!isParticipant) {
        socket.emit('error', {
          message: 'Unauthorized: You are not a participant in this exchange.',
        });
        return;
      }

      const roomName = `room_${requestId}`;
      socket.join(roomName);

      console.log(`👤 User ${socket.userId} joined room ${roomName}`);
      socket.emit('joinedRoom', { requestId, room: roomName });

    } catch (err) {
      console.error('Error joining socket room:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave conversation room
  socket.on('leaveRoom', ({ requestId }) => {
    if (requestId) {
      const roomName = `room_${requestId}`;
      socket.leave(roomName);
      console.log(`👤 User ${socket.userId} left room ${roomName}`);
    }
  });

  // Send real-time message
  socket.on('sendMessage', async ({ requestId, text }) => {
    try {
      if (!requestId || !text || !text.trim()) return;

      const request = await Request.findById(requestId);

      if (!request || request.status !== 'accepted') {
        socket.emit('error', {
          message: 'Messages can only be sent for accepted skill exchanges.',
        });
        return;
      }

      const isSender = request.senderId.toString() === socket.userId;
      const isReceiver = request.receiverId.toString() === socket.userId;

      if (!isSender && !isReceiver) {
        socket.emit('error', {
          message: 'Unauthorized: Not a participant in this exchange.',
        });
        return;
      }

      const receiverId = isSender ? request.receiverId : request.senderId;

      const newMessage = await Message.create({
        requestId,
        senderId: socket.userId,
        receiverId,
        text: text.trim(),
        read: false,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'name profileImage')
        .populate('receiverId', 'name profileImage');

      const roomName = `room_${requestId}`;

      io.to(roomName).emit('receiveMessage', populatedMessage);

      io.to(`user_${receiverId}`).emit('conversationUpdated', {
        requestId,
        lastMessage: {
          text: populatedMessage.text,
          senderId: populatedMessage.senderId,
          createdAt: populatedMessage.createdAt,
        },
      });

    } catch (err) {
      console.error('Error sending socket message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ requestId, isTyping, userName }) => {
    if (requestId) {
      socket.to(`room_${requestId}`).emit('userTyping', {
        requestId,
        userId: socket.userId,
        userName,
        isTyping,
      });
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async ({ requestId }) => {
    try {
      if (!requestId) return;

      await Message.updateMany(
        {
          requestId,
          receiverId: socket.userId,
          read: false,
        },
        { $set: { read: true } }
      );

      socket.to(`room_${requestId}`).emit('messagesRead', {
        requestId,
        readBy: socket.userId,
      });

    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 SkillSwap Server running on port ${PORT} (with Socket.IO)`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

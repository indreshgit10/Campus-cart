import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { proxyPDF, getCloudinarySignature } from './controllers/pdfController.js';
import Message from './models/Message.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load Environment Variables
dotenv.config();

// Database connection will be initiated in startServer

const app = express();
const httpServer = createServer(app);

// Middlewares - CRITICAL: CORS must be first
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Security Middlewares
app.use(helmet());
app.use(hpp());

// Performance Testing
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use('/api/', limiter);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Health check to confirm server is up even if DB is slow
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/pdf-proxy', proxyPDF);
app.get('/api/cloudinary/sign', getCloudinarySignature);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Socket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', (data) => {
    const { productId, senderId, receiverId } = data;
    if (!senderId || !receiverId) return;
    const ids = [String(senderId), String(receiverId)].sort();
    const roomId = (productId && isValidObjectId(productId)) 
      ? `${productId}-${ids[0]}-${ids[1]}`
      : `dm-${ids[0]}-${ids[1]}`;
    socket.join(roomId);
    socket.join(`user-${senderId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { productId, senderId, receiverId, text } = data;
      if (!receiverId || !senderId) throw new Error('senderId and receiverId are required');
      const ids = [String(senderId), String(receiverId)].sort();
      const isProductChat = productId && isValidObjectId(productId);
      const roomId = isProductChat 
        ? `${productId}-${ids[0]}-${ids[1]}`
        : `dm-${ids[0]}-${ids[1]}`;
      const dbProductId = isProductChat ? productId : null;

      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        product: dbProductId,
        text: text,
        isRead: false
      });

      io.to(roomId).emit('receive_message', newMessage);
      io.to(`user-${receiverId}`).emit('new_notification', {
        type: 'MESSAGE',
        senderId: senderId,
        productId: dbProductId
      });
    } catch (error) {
      console.error('Socket error:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Base Route
app.get('/', (req, res) => {
  res.send('CampusCart API is running...');
});

app.use(notFound);
app.use(errorHandler);

// 7. Start Server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  if (process.env.NODE_ENV !== 'test') {
    // Start listening immediately so cloud health-checks pass
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server starting on port ${PORT}...`);
      console.log(`🔌 Initializing MongoDB connection...`);
    });
  }

  try {
    await connectDB();
    console.log('✅ Server is fully operational and connected to DB.');
  } catch (err) {
    console.error('❌ CRITICAL: Database connection failed during startup:', err.message);
  }
};

startServer();

export { app, httpServer };
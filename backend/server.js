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

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(cors());

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

app.use(express.json());

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

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, httpServer };
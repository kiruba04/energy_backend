import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import User from './routes/userRouter.js';
import productRoutes from './routes/productRoutes.js';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import bidRoutes from './routes/bidRoutes.js';
import bidSocket from './socket/bidSocket.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new socketIo(server, { cors: { origin: 'https://energytrade.netlify.app' } });

/* Middleware */
app.use(express.json());
app.use(cors({
  origin: 'https://energytrade.netlify.app',
  credentials: true
}));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://energytrade.netlify.app'); // Replace with your actual frontend URL
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

/* Routes */
app.use('/api/user', User);
app.use('/api/products', productRoutes);
app.use('/api/bids', bidRoutes);

/* Socket.io setup */
bidSocket(io);

/* Connect to MongoDB */
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

/* Start the server */
const PORT = 8800;
server.listen(PORT, () => {
  connect();
  console.log(`Server running on port ${PORT}`);
});

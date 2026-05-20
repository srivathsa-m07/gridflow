import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';

let ioInstance: Server | null = null;

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`Client connected via Socket.IO: ${socket.id}`);
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server | null => {
  return ioInstance;
};

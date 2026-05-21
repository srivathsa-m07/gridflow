import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
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
    const token = socket.handshake.auth?.token;

    if (token) {
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { organizationId?: string };
        if (payload.organizationId) {
          socket.join(payload.organizationId);
        }
      } catch {
        logger.warn(`Socket connection authenticated with invalid token: ${socket.id}`);
      }
    }

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

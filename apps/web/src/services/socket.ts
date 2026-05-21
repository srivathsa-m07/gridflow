import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'GRIDFLOW_AUTH_TOKEN';

export const socketService = {
  connect: (): Socket => {
    const token = localStorage.getItem(TOKEN_KEY);
    return io(SOCKET_URL, {
      auth: {
        token
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 3000
    });
  }
};

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export const socketService = {
  connect: (): Socket => {
    return io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 3000
    });
  }
};

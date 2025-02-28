import { io } from 'socket.io-client';

const socket = io(process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5555', {
  transports: ['websocket', 'polling'],
});

export default socket;

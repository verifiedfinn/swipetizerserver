// socket js needed to run sockets 
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;

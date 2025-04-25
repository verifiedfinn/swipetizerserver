import { io } from "socket.io-client";

// Ensuring proper connection configuration
const socket = io({
  autoConnect: false,  // Prevent automatic connection until explicitly triggered
});

export default socket;

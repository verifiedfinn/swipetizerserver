// socket js needed to run sockets 
import { io } from "socket.io-client";

// Ensuring proper connection configuration
const socket = io("https://2425-cs7025-group2.scss.tcd.ie", {
  autoConnect: false,           
  transports: ["polling"],      
});

export default socket;

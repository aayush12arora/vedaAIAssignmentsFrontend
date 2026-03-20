import { io } from 'socket.io-client';
const socket = io("http://50.17.69.250", {
  transports: ["websocket"]
});

socket.on("connect", () => console.log("connected"));
socket.on("disconnect", (r) => console.log("disconnected", r));
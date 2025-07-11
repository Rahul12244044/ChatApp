import { io } from "socket.io-client";

const URL = "http://localhost:5000"; // backend

export const socket = io(URL, {
  autoConnect: false,
});

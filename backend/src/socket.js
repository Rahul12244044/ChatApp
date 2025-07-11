
// src/socket.js

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => {
  if (!ioInstance) {
    throw new Error("❌ Socket.io instance not set. Call setSocketIO(io) first.");
  }
  return ioInstance;
};

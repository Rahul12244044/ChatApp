import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";

import path from "path";

import authRouter from "./src/routes/auth.routes.js";
import messageRouter from "./src/routes/message.routes.js";
import userRouter from "./src/routes/user.routes.js";
import uploadRouter from "./src/routes/upload.routes.js";
import { setSocketIO } from "./src/socket.js";
dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "https://talkrandoms.netlify.app",
  "https://randomfriendstalking.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));



const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

setSocketIO(io);

app.use(express.json());

app.use("/api/user", authRouter);
app.use("/api/messages",messageRouter);
app.use("/api/users", userRouter);
app.use("/api/upload", uploadRouter);

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

connectDB();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const onlineUsers = new Map();


io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
     io.emit("online-users", Array.from(onlineUsers.keys())); 
  });
  
  
socket.on("delete-msg", ({ messageId }) => {
  io.emit("msg-deleted", { messageId }); 
});



  socket.on("typing", ({ to, from }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) {
      io.to(sendTo).emit("typing", { from });
    }
  });
  socket.on("mark-as-seen", ({ from, to }) => {
  const receiverSocketId = onlineUsers.get(to);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("mark-as-seen", { from, to }); 
  }
});

  socket.on("stop-typing", ({ to, from }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) {
      io.to(sendTo).emit("stop-typing", { from });
    }
  });
  socket.on("send-msg", (data) => {
  const sendToSocketId = onlineUsers.get(data.to);
  const senderSocketId = onlineUsers.get(data.from); 

  if (sendToSocketId) {
    io.to(sendToSocketId).emit("msg-receive", {
      from: data.from,
      to: data.to,
      content: data.content,
      file: data.file, 
    });
  }


  if (senderSocketId) {
    io.to(senderSocketId).emit("msg-receive", {
      from: data.from,
      to: data.to,
      content: data.content,
      file: data.file, 
    });
  }

});

  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
        io.emit("online-users", Array.from(onlineUsers.keys())); 
  });
});
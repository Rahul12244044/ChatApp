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

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
setSocketIO(io);

app.use(cors());
app.use(express.json());

app.use("/api/user", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/users", userRouter);
app.use("/api/upload", uploadRouter);

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

connectDB();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const onlineUsers = new Map();


io.on("connection", (socket) => {
  // ✅ Add user to online users
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
     io.emit("online-users", Array.from(onlineUsers.keys())); // 🔄 broadcast
  });
  socket.on("typing", ({ to, from }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) {
      io.to(sendTo).emit("typing", { from });
    }
  });
  socket.on("mark-as-seen", ({ from, to }) => {
  const senderSocket = onlineUsers.get(from);
  if (senderSocket) {
    io.to(senderSocket).emit("message-seen", { from, to });
  }
});

  socket.on("stop-typing", ({ to, from }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) {
      io.to(sendTo).emit("stop-typing", { from });
    }
  });

  // ✅ Listen for send-msg from one user
  socket.on("send-msg", (data) => {
  const sendToSocketId = onlineUsers.get(data.to);
  const senderSocketId = onlineUsers.get(data.from); // <-- Add this line

  // Emit to receiver
  if (sendToSocketId) {
    io.to(sendToSocketId).emit("msg-receive", {
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
    });
  }

  // ✅ Also emit back to sender (optional but helpful)
  if (senderSocketId) {
    io.to(senderSocketId).emit("msg-receive", {
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
    });
  }

});

  // (optional) handle disconnect
  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
        io.emit("online-users", Array.from(onlineUsers.keys())); // 🔄 broadcast
  });
});

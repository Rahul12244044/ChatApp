import express from "express";
import userModel from "../models/user.model.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAllUsers, addFriend, removeFriend, getFriends } from "../controllers/user.controller.js";

const userRouter = express.Router();

// ✅ Get all users (already exists)
userRouter.get("/", authMiddleware, getAllUsers);

// ✅ Friends routes
userRouter.post("/friends/add/:friendId", authMiddleware, addFriend);
userRouter.delete("/friends/remove/:friendId", authMiddleware, removeFriend);
userRouter.get("/friends", authMiddleware, getFriends);

export default userRouter;

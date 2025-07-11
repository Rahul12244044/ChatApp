// src/routes/user.routes.js
import express from "express";
import userModel from "../models/user.model.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {getAllUsers} from "../controllers/user.controller.js";
const userRouter = express.Router();

userRouter.get("/", authMiddleware,getAllUsers);

export default userRouter;

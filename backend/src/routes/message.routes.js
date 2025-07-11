import express from "express";
import { sendMessage, getMessages,sennMessage,deleteMessage} from "../controllers/message.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);           // Send a message
router.get("/:userId", authMiddleware, getMessages);     // Get chat between two users
router.patch("/mark-seen/:fromUserId",authMiddleware,sennMessage)
router.delete("/:messageId", deleteMessage);
export default router;

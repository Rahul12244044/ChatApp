// src/models/message.model.js
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file: {
      type: String, // store the file URL here
    },
    content: {
       type: String,
       trim: true,
    },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false } // ✅ NEW FIELD
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;

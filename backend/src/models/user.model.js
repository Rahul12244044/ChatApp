import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "", // Or a default placeholder image
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatUser", // self-reference
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model("ChatUser", userSchema);
export default userModel;

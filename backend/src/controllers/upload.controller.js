import userModel from "../models/user.model.js";
import path from "path";
import fs from "fs";

// Accept io from app.js or pass as param in setup
import { getSocketIO } from "../socket.js" // You'll need to export io from socket setup

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // Requires auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No file uploaded." });
    }

    const imageUrl = `/uploads/${file.filename}`;

    const user = await userModel.findById(userId);
    if (!user) {
      fs.unlinkSync(file.path); // Cleanup
      return res.status(404).json({ msg: "User not found." });
    }

    // Delete previous image
    if (user.profileImage && fs.existsSync(`uploads/${path.basename(user.profileImage)}`)) {
      fs.unlinkSync(`uploads/${path.basename(user.profileImage)}`);
    }

    user.profileImage = imageUrl;
    await user.save();

    const io = getSocketIO(); // Get socket instance
    io.emit("profile-updated", {
      userId: user._id.toString(),
      avatar: imageUrl,
    });

    // Remove sensitive fields
    const { password, ...safeUser } = user.toObject();

    return res.status(200).json({
      msg: "Profile picture updated successfully.",
      imageUrl,
      user: safeUser,
    });
  } catch (err) {
    console.error("❌ Error updating profile picture:", err);
    return res.status(500).json({ msg: "Internal server error." });
  }
}
export const uploadFile=(req,res)=>{
  const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl: filePath });
}

import userModel from "../models/user.model.js";
import path from "path";
import fs from "fs";


import { getSocketIO } from "../socket.js" 

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; 
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No file uploaded." });
    }

    const imageUrl = `uploads/${file.filename}`;

    const user = await userModel.findById(userId);
    console.log("user: ");
    console.log(user);
    if (!user) {
      fs.unlinkSync(file.path); 
      return res.status(404).json({ msg: "User not found." });
    }

    
    if (user.profileImage && fs.existsSync(`uploads/${path.basename(user.profileImage)}`)) {
      fs.unlinkSync(`uploads/${path.basename(user.profileImage)}`);
    }

    user.profileImage = imageUrl;
    console.log("after update: ");
    console.log(user);
    await user.save();

    const io = getSocketIO(); 
    io.emit("profile-updated", {
      userId: user._id.toString(),
      avatar: imageUrl,
    });

   
    const { password, ...safeUser } = user.toObject();

    return res.status(200).json({
      msg: "Profile picture updated successfully.",
      imageUrl,
      user: safeUser,
    });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    return res.status(500).json({ msg: "Internal server error." });
  }
}
export const uploadFile=(req,res)=>{
  const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl: filePath });
}

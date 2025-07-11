import userModel from "../models/user.model.js";
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ _id: { $ne: req.user.id } })
      .select("username email profileImage createdAt");

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

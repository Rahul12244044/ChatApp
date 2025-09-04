import userModel from "../models/user.model.js";

// ✅ Get all users (except logged in user)
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

// ✅ Add friend
export const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    if (userId === friendId) {
      return res.status(400).json({ msg: "You cannot add yourself" });
    }

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.friends && user.friends.includes(friendId)) {
      return res.status(400).json({ msg: "Already a friend" });
    }

    user.friends = [...(user.friends || []), friendId];
    await user.save();

    res.json({ msg: "Friend added successfully", friends: user.friends });
  } catch (err) {
    console.error("Failed to add friend:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    user.friends = (user.friends || []).filter(
      (id) => id.toString() !== friendId
    );

    await user.save();

    res.json({ msg: "Friend removed successfully", friends: user.friends });
  } catch (err) {
    console.error("Failed to remove friend:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get friends (populated with user info)
export const getFriends = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .populate("friends", "username email profileImage createdAt");
      console.log("all added Users: ");
      console.log(user);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user.friends || []);
  } catch (err) {
    console.error("Failed to fetch friends:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

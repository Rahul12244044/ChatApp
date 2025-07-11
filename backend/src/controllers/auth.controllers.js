import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const userExists = await userModel.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({ username, email, passwordHash });
    const token = generateToken(newUser._id);

    res.status(201).json({
      user: { _id: newUser._id, username: newUser.username, email },
      token,
    });
  } catch (err) {
    console.log("err: "+err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("req.body: ");
    console.log(req.body);
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    console.log("user: ");
    console.log(user);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      user: { _id: user._id, username: user.username, email },
      token,
    });
  } catch (err) {
    console.log("error: ");
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

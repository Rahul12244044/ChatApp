import express from "express";
import upload from "../middlewares/profile.images.js";
import { updateProfilePicture,uploadFile } from "../controllers/upload.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/profile-pic", authMiddleware,upload.single("avatar"), updateProfilePicture);
router.post("/file", upload.single("file"),uploadFile);

export default router;

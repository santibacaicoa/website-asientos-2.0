import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  me,
  forgotPasswordController,
  resetPasswordController,
  updateProfilePhotoController,
  getProfileController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.get("/profile", requireAuth, getProfileController);
router.put("/profile/photo", requireAuth, updateProfilePhotoController);

export default router;
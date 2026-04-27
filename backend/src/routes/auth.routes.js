import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  me,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/me", requireAuth, me);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;

export async function forgotPasswordController(req, res) {
  try {
    const validation = validateForgotPasswordInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos.",
        errors: validation.errors,
      });
    }

    const result = await forgotPassword(req.body);

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function resetPasswordController(req, res) {
  try {
    const validation = validateResetPasswordInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos.",
        errors: validation.errors,
      });
    }

    const result = await resetPassword(req.body);

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
}
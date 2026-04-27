import {
  registerUser,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../services/auth.service.js";

import {
  validateRegisterInput,
  validateVerifyEmailInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../validators/auth.validator.js";

export async function register(req, res) {
  try {
    const validation = validateRegisterInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos.",
        errors: validation.errors,
      });
    }

    const result = await registerUser(req.body);

    return res.status(201).json({
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

export async function verifyEmail(req, res) {
  try {
    const validation = validateVerifyEmailInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos.",
        errors: validation.errors,
      });
    }

    const result = await verifyEmailToken(req.body);

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

export async function login(req, res) {
  try {
    const validation = validateLoginInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Datos inválidos.",
        errors: validation.errors,
      });
    }

    const result = await loginUser(req.body);

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
export async function me(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al obtener usuario autenticado.",
    });
  }
}
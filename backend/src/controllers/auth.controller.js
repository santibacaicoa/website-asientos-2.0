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

export const updateProfilePhoto = async (req, res) => {
  try {
    const { email, foto } = req.body;

    if (!email || !foto) {
      return res.status(400).json({ ok: false, message: "Faltan datos" });
    }

    await pool.query(
      "UPDATE usuarios SET foto = $1 WHERE email = $2",
      [foto, email]
    );

    return res.json({
      ok: true,
      message: "Foto actualizada correctamente",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error servidor" });
  }
};
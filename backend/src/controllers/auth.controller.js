import {
  registerUser,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfilePhoto,
  getProfile,
} from "../services/auth.service.js";

import {
  validateRegisterInput,
  validateVerifyEmailInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../validators/auth.validator.js";

/* =========================================================
   REGISTER
   Función:
   - Recibe email/password.
   - Valida datos.
   - Llama al service para enviar token de verificación.
========================================================= */
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

/* =========================================================
   VERIFY EMAIL
   Función:
   - Recibe email, token, nombre y apellido.
   - Si el token es correcto, crea el usuario real.
========================================================= */
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

/* =========================================================
   LOGIN
   Función:
   - Valida email/password.
   - Si son correctos, devuelve token JWT y datos del usuario.
========================================================= */
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

/* =========================================================
   ME
   Función:
   - Devuelve el usuario autenticado.
   - Depende del middleware requireAuth.
========================================================= */
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

/* =========================================================
   FORGOT PASSWORD
   Función:
   - Recibe email.
   - Envía token para restablecer contraseña.
========================================================= */
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

/* =========================================================
   RESET PASSWORD
   Función:
   - Recibe email, token y nueva contraseña.
   - Si el token es válido, cambia la contraseña.
========================================================= */
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

export async function updateProfilePhotoController(req, res) {
  try {
    const result = await updateProfilePhoto({
      userId: req.user.id,
      foto: req.body.foto,
    });

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

export async function getProfileController(req, res) {
  try {
    const result = await getProfile({
      userId: req.user.id,
    });

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
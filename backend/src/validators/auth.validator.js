export function validateRegisterInput(data) {
  const errors = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("El email es obligatorio.");
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("La contraseña es obligatoria.");
  }

  if (data.password && data.password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateVerifyEmailInput(data) {
  const errors = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("El email es obligatorio.");
  }

  if (!data.token || typeof data.token !== "string") {
    errors.push("El token es obligatorio.");
  }

  if (!data.nombre || typeof data.nombre !== "string") {
    errors.push("El nombre es obligatorio.");
  }

  if (!data.apellido || typeof data.apellido !== "string") {
    errors.push("El apellido es obligatorio.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput(data) {
  const errors = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("El email es obligatorio.");
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("La contraseña es obligatoria.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateForgotPasswordInput(data) {
  const errors = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("El email es obligatorio.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateResetPasswordInput(data) {
  const errors = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("El email es obligatorio.");
  }

  if (!data.token || typeof data.token !== "string") {
    errors.push("El token es obligatorio.");
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("La nueva contraseña es obligatoria.");
  }

  if (data.password && data.password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
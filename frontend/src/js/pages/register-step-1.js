const registerStep1Form = document.getElementById("registerStep1Form");

registerStep1Form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("registerEmail")?.value.trim();
  const password = document.getElementById("registerPassword")?.value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat")?.value;

  if (!email || !password || !passwordRepeat) {
    alert("Completá todos los campos.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== passwordRepeat) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  sessionStorage.setItem(
    "pendingRegister",
    JSON.stringify({
      email,
      password,
    })
  );

  window.location.href = "./register-step-2.html";
});
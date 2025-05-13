document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-registro");
  const passwordInput = form.querySelector('input[name="contrasena"]');
  const confirmarPasswordInput = form.querySelector('#confirmarContrasena');

  form.addEventListener("submit", (e) => {
    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;
    const errors = [];

    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres.");
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula.");
    }

    // Sin espacios
    if (/\s/.test(password)) {
      errors.push("La contraseña no debe contener espacios.");
    }

    // Confirmación de contraseña
    if (password !== confirmarPassword) {
      errors.push("Las contraseñas no coinciden.");
    }

    // Mostrar errores
    if (errors.length > 0) {
      e.preventDefault();
      alert(errors.join("\n"));
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-registro");
  const passwordInput = document.getElementById("contrasena");
  const confirmarPasswordInput = document.getElementById("confirmarContrasena");
  const errorDiv = document.querySelector(".invalid-feedback");

  // 👁‍🗨 Toggle visibilidad para contraseña
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  if (toggleConfirmPassword && confirmarPasswordInput) {
    toggleConfirmPassword.addEventListener("click", function () {
      const type = confirmarPasswordInput.getAttribute("type") === "password" ? "text" : "password";
      confirmarPasswordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("nombre").value.trim();
    const email = document.getElementById("correo").value.trim();
    const tipoDoc = document.getElementById("tipoDocumento").value.trim();
    const numeroDoc = document.getElementById("numeroDocumento").value.trim();
    const telefono = document.getElementById("numeroCelular").value.trim();
    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;

    const errors = [];

    // Validaciones
    if (name === "") errors.push("El nombre es obligatorio.");

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!emailRegex.test(email)) errors.push("El correo electrónico no es válido.");

    if (tipoDoc === "") errors.push("Debe seleccionar un tipo de documento.");
    if (!/^\d{5,}$/.test(numeroDoc)) errors.push("El número de documento debe tener al menos 5 dígitos.");
    if (!/^\d{7,15}$/.test(telefono)) errors.push("El número de celular debe tener entre 7 y 15 dígitos.");
    if (password.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres.");
    if (!/[a-z]/.test(password)) errors.push("Debe contener al menos una letra minúscula.");
    if (!/[A-Z]/.test(password)) errors.push("Debe contener al menos una letra mayúscula.");
    if (/\s/.test(password)) errors.push("La contraseña no debe contener espacios.");
    if (password !== confirmarPassword) errors.push("Las contraseñas no coinciden.");

    const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    const yaRegistrado = usuariosRegistrados.some(u => u.email === email);
    if (yaRegistrado) errors.push("Este correo ya está registrado.");

    if (errors.length > 0) {
      errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
      errorDiv.style.display = "block";
      return;
    } else {
      errorDiv.style.display = "none";
    }

    const usuario = {
      name,
      email,
      password,
      tipoDocumento: tipoDoc,
      numeroDocumento: numeroDoc,
      numeroCelular: telefono
    };

    try {
      usuariosRegistrados.push(usuario);
      localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
      console.log("Usuario registrado correctamente:", usuario);
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }

    // Mensaje de éxito
    const successDiv = document.createElement("div");
    successDiv.className = "alert alert-success mt-3";
    successDiv.innerHTML = `
      <p>Su usuario fue creado con éxito. Recibirá un correo de confirmación.</p>
    `;
    const formContainer = document.getElementById("formularUsuario").parentNode;
    formContainer.appendChild(successDiv);

    setTimeout(() => {
      document.getElementById("formularUsuario").reset();
      successDiv.remove();
    }, 2000);

    form.submit(); // Formspree u otro destino
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-registro");
  const passwordInput = form.querySelector('input[name="contrasena"]');
  const confirmarPasswordInput = form.querySelector('#confirmarContrasena');
  const errorDiv = document.querySelector(".invalid-feedback");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevenir el envío automático del formulario

    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const tipoDoc = document.getElementById("tipoDocumento").value.trim();
    const numeroDoc = document.getElementById("numeroDocumento").value.trim();
    const telefono = document.getElementById("numeroCelular").value.trim();
    const errors = [];

    // Validaciones adicionales
    if (nombre === "") {
      errors.push("El nombre es obligatorio.");
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!emailRegex.test(correo)) {
      errors.push("El correo electrónico no es válido.");
    }

    if (tipoDoc === "") {
      errors.push("Debe seleccionar un tipo de documento.");
    }

    if (!/^\d{5,}$/.test(numeroDoc)) {
      errors.push("El número de documento debe tener al menos 5 dígitos.");
    }

    if (!/^\d{7,15}$/.test(telefono)) {
      errors.push("El número de celular debe tener entre 7 y 15 dígitos.");
    }

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula.");
    }

    if (/\s/.test(password)) {
      errors.push("La contraseña no debe contener espacios.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula.");
    }

    if (password !== confirmarPassword) {
      errors.push("Las contraseñas no coinciden.");
    }

    // Mostrar errores
    if (errors.length > 0) {
      errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
      errorDiv.style.display = "block";
      return;
    } else {
      errorDiv.style.display = "none";
    }

    // Crear objeto JSON solo si no hay errores
    const usuario = {
      nombre,
      correo,
      tipoDocumento: tipoDoc,
      numeroDocumento: numeroDoc,
      numeroCelular: telefono,
      contrasena: password
    };

    // Almacenar en localStorage
    try {
      const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
      usuariosRegistrados.push(usuario);
      localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
      console.log("Usuario válido almacenado en localStorage:", JSON.stringify(usuario, null, 2));
    } catch (error) {
      console.error("Error al guardar el usuario en localStorage:", error);
    }

    // Mostrar mensaje de éxito
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.innerHTML = `
      <p>Su usuario fue creado con éxito. Recibirá un correo de confirmación.</p>
      <p>Los datos han sido guardados en localStorage.</p>
    `;
    successDiv.style.backgroundColor = "#d4edda";
    successDiv.style.color = "#155724";
    successDiv.style.border = "1px solid #c3e6cb";
    successDiv.style.borderRadius = "5px";
    successDiv.style.padding = "10px";
    successDiv.style.marginTop = "10px";
    successDiv.style.fontSize = "14px";

    const formContainer = document.getElementById("formularUsuario").parentNode;
    formContainer.appendChild(successDiv);

    // Vaciar los inputs después de 2 segundos
    setTimeout(() => {
      document.getElementById("formularUsuario").reset();
    }, 2000);

    // Enviar el formulario manualmente a Formspree
    form.submit();
  });
});

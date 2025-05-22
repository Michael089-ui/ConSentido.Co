document.addEventListener('DOMContentLoaded', function() {
  // 👨‍💼 Usuario admin hardcodeado (solo si no existe ya)
  const adminEmail = "admin@admin.com";
  const adminUser = {
    name: "Administrador",
    email: adminEmail,
    password: "Admin1234",  // contraseña predeterminada
    tipoDocumento: "CC",
    numeroDocumento: "123456789",
    numeroCelular: "3001234567",
    rol: "admin"
  };

  const usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
  const existeAdmin = usuarios.some(u => u.email === adminEmail);
  if (!existeAdmin) {
    usuarios.push(adminUser);
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));
  }

  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('eye-icon');
  const loginButton = document.getElementById('loginButton');

  if (!loginForm || !loginMessage || !emailInput || !passwordInput || !eyeIcon || !loginButton) {
    console.error('Falta algún elemento del DOM');
    return;
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showMessage('Por favor, complete todos los campos.', 'danger');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
          email: user.email,
          name: user.name,
          rol: user.rol || "usuario"
        }));

        console.log('Rol del usuario encontrado:', user ? user.rol : 'Usuario no encontrado'); // Depuración adicional
        console.log('Redirigiendo a:', user && user.rol === "admin" ? '/pages/admin/Admin_Home.html' : '../index.html'); // Depuración adicional

        showMessage('¡Inicio de sesión exitoso!', 'success');
        setTimeout(() => {
          if (user.rol === "admin") {
            window.location.href = '/pages/admin/Admin_Home.html';
          } else {
            window.location.href = '../index.html';
          }
        }, 1500);
      } else {
        showMessage('Correo o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      console.error('Error al procesar el login:', error);
      showMessage('Error al procesar la solicitud', 'danger');
    }
  });

  eyeIcon.addEventListener('click', function() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
  });

  function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = `alert alert-${type} mt-3`;
    loginMessage.style.display = 'block';

    if (type === 'danger') {
      setTimeout(() => {
        loginMessage.style.display = 'none';
      }, 3000);
    }
  }
});

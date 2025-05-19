document.addEventListener('DOMContentLoaded', function() {
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
          name: user.name
        }));

        showMessage('¡Inicio de sesión exitoso!', 'success');
        setTimeout(() => {
          window.location.href = '../index.html';
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

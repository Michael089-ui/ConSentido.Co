document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage'); // Cambiado de loginError a loginMessage
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const eyeIcon = document.getElementById('eye-icon');
    const loginButton = document.getElementById('loginButton');
 
    // Verificar que todos los elementos existen
    if (!loginForm || !loginMessage || !emailInput || !passwordInput || !eyeIcon || !loginButton) {
        console.error('Falta algún elemento del DOM');
        return;
    }
 
    // Guardar usuarios de ejemplo si no existen
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                email: 'usuario@example.com',
                password: 'password123',
                name: 'Usuario Demo'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
 
    // Manejar envío del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenir envío del formulario por defecto
 
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
 
        // Validar campos vacíos
        if (!email || !password) {
            showMessage('Por favor, complete todos los campos.', 'danger');
            return;
        }
 
        // Obtener usuarios y validar credenciales
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
 
            if (user) {
                // Login exitoso
                localStorage.setItem('currentUser', JSON.stringify({
                    email: user.email,
                    name: user.name
                }));
 
                showMessage('¡Inicio de sesión exitoso!', 'success');
               
                // Redireccionar después de mostrar el mensaje
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
 
    // Toggle password visibility
    eyeIcon.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });
 
    // Función unificada para mostrar mensajes
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
// Usuario admin hardcodeado
const adminUser = {
    name: "Administrador",
    email: "admin@consentido.com",
    password: "admin123",
    rol: "admin"
};

document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que el admin existe en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    if (!usuarios.some(u => u.email === adminUser.email)) {
        usuarios.push(adminUser);
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
    }

    // Manejar el formulario de login
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Manejar visibilidad de la contraseña
    const eyeIcon = document.getElementById('eye-icon');
    const passwordInput = document.getElementById('loginPassword');
    
    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }
});

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    const user = usuarios.find(u => u.email === email && u.password === password);

    if (user) {
        // Guardar información del usuario actual
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email,
            rol: user.rol
        }));

        // Redireccionar según el rol
        if (user.rol === 'admin') {
            window.location.href = '/pages/admin/admin.html';
        } else {
            window.location.href = '/index.html';
        }
    } else {
        showMessage('Credenciales incorrectas', 'danger');
    }
}

function showMessage(message, type) {
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) {
        loginMessage.className = `alert alert-${type}`;
        loginMessage.style.display = 'block';
        loginMessage.textContent = message;
    }
}

export { adminUser };
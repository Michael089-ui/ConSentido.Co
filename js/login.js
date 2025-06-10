import { AuthService } from '../services/auth_service.js';

const authService = new AuthService();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const user = await authService.login(email, password);

                // Según el rol, redirigir a la interfaz correspondiente
                if (user.rol === 'admin') {
                    window.location.href = '../admin/admin.html';
                } else {
                    window.location.href = '../../index.html';
                }

            } catch (error) {
                showMessage(error.message || 'Credenciales incorrectas', 'danger');
            }
        });
    }
});

function showMessage(message, type) {
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) {
        loginMessage.className = `alert alert-${type}`;
        loginMessage.style.display = 'block';
        loginMessage.textContent = message;
    }
}
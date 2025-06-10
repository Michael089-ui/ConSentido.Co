import { AuthService } from './services/auth_services.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Mostrar indicador de carga
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Accediendo...';
            }

            try {
                // Instanciar el servicio aquí para asegurar que siempre es fresco
                const authService = new AuthService();
                
                // Pasar credenciales como objeto según espera el método login
                const user = await authService.login({ email, password });

                // Según el rol, redirigir a la interfaz correspondiente
                if (user.rol === 'admin') {
                    window.location.href = './admin/admin.html';
                } else {
                    window.location.href = '../index.html';
                }

            } catch (error) {
                // Restaurar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Acceder';
                }
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
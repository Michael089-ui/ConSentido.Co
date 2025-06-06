import { UserService } from '../services/user_services.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form-registro");
    const userService = new UserService();

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const confirmarContrasena = document.getElementById('confirmarContrasena').value;

        // ⚠️ Validar contraseñas
        if (contrasena !== confirmarContrasena) {
            showMessage('Las contraseñas no coinciden', 'danger');
            return;
        }

        // ✅ Crear objeto con los datos que espera el backend
        const userData = {
            nombre: nombre,
            contrasena: contrasena,
            rol: 'Usuario' // Este valor debe coincidir con el Enum del backend
        };

        try {
            // 🔁 Enviar datos al backend
            await userService.addUser(userData);
            showMessage('¡Registro exitoso! Redirigiendo...', 'success');

            // ✅ Redirigir después de un corto tiempo
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        } catch (error) {
            console.error('Error al registrar:', error);
            showMessage('Error al registrar usuario', 'danger');
        }
    });

    // ✅ Mostrar alertas Bootstrap
    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-2`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        form.insertBefore(alertDiv, form.firstChild);
        setTimeout(() => alertDiv.remove(), 4000);
    }
});

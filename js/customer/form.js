import { UserService } from '../services/user_services.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form-registro");
    const userService = new UserService();
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // 1. Preparar datos del usuario
            const userData = {
                id: Date.now().toString(), // Generar ID único
                name: document.getElementById('nombre').value,
                email: document.getElementById('correo').value,
                password: document.getElementById('contrasena').value,
                tipoDoc: document.getElementById('tipo_documento').value,
                numeroDoc: document.getElementById('numero_documento').value,
                celular: document.getElementById('celular').value,
                rol: 'cliente',
                estado: 'activo'
            };

            // 2. Validar contraseñas
            if (userData.password !== document.getElementById('confirmarContrasena').value) {
                showMessage('Las contraseñas no coinciden', 'danger');
                return;
            }

            // 3. Guardar en localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
            usuarios.push(userData);
            localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));

            // 4. Guardar en el servidor JSON
            try {
                await userService.addUser(userData);
                console.log('Usuario guardado en el servidor');
            } catch (error) {
                console.error('Error al guardar en el servidor:', error);
                // Continuar con el proceso aunque falle el servidor
            }

            // 5. Enviar a Formspree y esperar respuesta
            const formspreeResponse = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (formspreeResponse.ok) {
                showMessage('Registro exitoso! Redirigiendo...', 'success');
                
                // Esperar 2 segundos antes de redireccionar
                setTimeout(() => {
                    window.location.replace('/index.html');
                }, 2000);

                // No es necesario hacer submit del formulario
                return false;
            }

        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al registrar usuario', 'danger');
        }
        return false; // Prevenir el envío normal del formulario
    }

    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        form.insertBefore(alertDiv, form.firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
});
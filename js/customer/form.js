// Importación de servicios necesarios para el registro de usuarios
import { CustomerUserService } from '../services/customer/user_services.js';
import { UIService } from '../services/ui-service.js';  // Importando el servicio UI centralizado

export class RegistrationManager {
    // Constructor que inicializa los servicios y elementos necesarios
    constructor() {
        // Servicios centralizados
        this.userService = new CustomerUserService();
        this.uiService = new UIService();
        
        // Formulario de registro
        this.form = document.querySelector(".form-registro");
        
        // Inicializar si estamos en la página de registro
        if (this.form) {
            this.init();
        }
    }

    // Método de inicialización que configura los eventos
    init() {
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Método para manejar el envío del formulario
    async handleSubmit(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const confirmarContrasena = document.getElementById('confirmarContrasena').value;

        // Validar que las contraseñas coincidan
        if (contrasena !== confirmarContrasena) {
            this.showMessage('Las contraseñas no coinciden', 'danger');
            return;
        }

        // Crear objeto con los datos que espera el backend
        const userData = {
            nombre: nombre,
            email: email,
            contrasena: contrasena,
            rol: 'cliente',
            estado: 'activo'
        };

        try {
            // Enviar datos al backend
            await this.userService.registerUser(userData);
            this.showMessage('¡Registro exitoso! Redirigiendo...', 'success');

            // Redirigir después de un corto tiempo
            setTimeout(() => {
                window.location.href = '/pages/customer/Login.html';
            }, 2000);
        } catch (error) {
            console.error('Error al registrar:', error);
            this.showMessage('Error al registrar usuario: ' + (error.message || 'Inténtalo más tarde'), 'danger');
        }
    }

    // Método para mostrar mensajes de alerta usando el servicio UI centralizado
    showMessage(message, type) {
        // Si el mensaje debe aparecer dentro del formulario (contextual)
        const formAlert = document.createElement('div');
        formAlert.className = `alert alert-${type} alert-dismissible fade show mt-2`;
        formAlert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        this.form.insertBefore(formAlert, this.form.firstChild);
        setTimeout(() => formAlert.remove(), 4000);
        
        // También usamos el servicio de UI para mensajes globales
        if (type === 'success') {
            this.uiService.showMessage(message, type);
        }
    }
}

// Inicializar el gestor cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    new RegistrationManager();
});
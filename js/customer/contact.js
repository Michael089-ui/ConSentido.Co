export class ContactManager {
    // Constructor que inicializa los elementos y configuraciones
    constructor() {
        // Elementos del DOM
        this.switchVender = document.getElementById('Vende');
        this.formSuperior = document.querySelector('.form-superior');
        this.formInferior = document.querySelector('.form-inferior');
        this.mainContainer = document.querySelector('main');
        
        // Inicializar la página
        this.init();
    }

    // Método de inicialización
    init() {
        // Verificar que estamos en la página de contacto
        if (!this.switchVender || !this.formSuperior || !this.formInferior) return;
        
        // Configurar el manejo del cambio de modo
        this.setupFormToggle();
        
        // Configurar los eventos de envío de formularios
        this.setupFormSubmissions();
    }

    // Configura el cambio entre formularios con el switch
    setupFormToggle() {
        this.switchVender.addEventListener('change', () => {
            if (this.switchVender.checked) {
                this.formSuperior.style.display = 'none';
                this.formInferior.style.display = 'block';
                this.mainContainer.style.backgroundColor = '#f8f4e9'; // Color beige claro
            } else {
                this.formSuperior.style.display = 'block';
                this.formInferior.style.display = 'none';
                this.mainContainer.style.backgroundColor = 'white';
            }
        });
    }

    // Configura los eventos de envío para ambos formularios
    setupFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(e.target);
            });
        });
    }

    // Maneja el envío de formularios
    async handleFormSubmit(form) {
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Resetear el formulario y mostrar mensaje de éxito
            form.reset();
            this.showSuccessModal();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.showMessage('Error al enviar el formulario. Por favor intente nuevamente.', 'danger');
        }
    }

    // Muestra un modal de éxito al enviar el formulario
    showSuccessModal() {
        const modalHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body text-center py-4">
                            <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                            <h4>¡Mensaje enviado con éxito!</h4>
                            <p>Gracias por contactarnos. Nos comunicaremos contigo pronto.</p>
                            <button class="btn btn-warning mt-3" onclick="window.location.href='/index.html'">
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        // Remover el modal cuando se cierre
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
            window.location.href = '/index.html';
        });
    }

    // Muestra mensajes de alerta en la interfaz
    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        this.mainContainer.prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Inicializar el manager cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});
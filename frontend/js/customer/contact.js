// Importación de servicios necesarios
import { HttpService } from '../services/http-service.js';
import { UIService } from '../services/ui-service.js';
import { FORM_CONFIG } from './assets.js';

export class ContactManager {
    // Constructor que inicializa los elementos y configuraciones
    constructor() {
        // Elementos del DOM
        this.switchVender = document.getElementById('Vende');
        this.formSuperior = document.querySelector('.form-superior');
        this.formInferior = document.querySelector('.form-inferior');
        this.mainContainer = document.querySelector('main');
        
        // Servicios
        this.httpService = new HttpService();
        this.uiService = new UIService();
        
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
                document.body.classList.remove(FORM_CONFIG.backgrounds.urgent);
                document.body.classList.add(FORM_CONFIG.backgrounds.light);
            } else {
                this.formSuperior.style.display = 'block';
                this.formInferior.style.display = 'none';
                document.body.classList.remove(FORM_CONFIG.backgrounds.light);
                document.body.classList.add(FORM_CONFIG.backgrounds.urgent);
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
            // Determinar el endpoint basado en el tipo de formulario
            const isVendorForm = form.classList.contains('form-inferior');
            const endpoint = isVendorForm ? FORM_CONFIG.endpoints.vendor : FORM_CONFIG.endpoints.contact;
            
            // Convertir FormData a objeto para usar con HttpService
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            // Usar HttpService para enviar datos
            await this.httpService.post(endpoint, formDataObj);
            
            // Resetear formulario y mostrar mensaje de éxito
            form.reset();
            this.showSuccessModal();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.uiService.showMessage('Error al enviar el formulario. Por favor intente nuevamente.', 'danger');
        }
    }

    // Muestra un modal de éxito al enviar el formulario
    showSuccessModal() {
        const modalConfig = {
            id: 'successModal',
            title: '¡Mensaje enviado con éxito!',
            content: `
                <div class="text-center">
                    <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                    <p>Gracias por contactarnos. Nos comunicaremos contigo pronto.</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Volver al inicio',
                    class: 'btn-warning',
                    callback: () => window.location.href = '/index.html'
                }
            ],
            onClose: () => window.location.href = '/index.html'
        };
        
        this.uiService.createModal(modalConfig).show();
    }

    // Muestra mensajes de alerta en la interfaz
    showMessage(message, type) {
        this.uiService.showMessage(message, type);
    }
}

// Inicializar el manager cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});
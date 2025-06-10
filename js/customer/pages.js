import { ComponentsManager } from './components.js';
import { ProductService } from '../services/customer/product_services.js';
import { HttpService } from '../services/http-service.js';
import { UIService } from '../services/ui-service.js';
import { FORM_CONFIG } from './assets.js';

export class ProductosVista {
    constructor() {
        this.productService = new ProductService();
        this.uiService = new UIService();
        this.categoria = document.body.dataset.categoria;
        this.productos = [];
        this.init();
    }

    async init() {
        try {
            // Obtener productos desde el servicio en lugar de localStorage
            this.productos = await this.productService.getAllProducts();
            this.mostrarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.showError('No se pudieron cargar los productos');
        }
    }

    mostrarProductos() {
        const contenedor = document.getElementById('productos-container');
        if (!contenedor) return;

        const productosFiltrados = this.productos.filter(producto => 
            producto.categoria && producto.categoria.toLowerCase() === this.categoria.toLowerCase()
        );

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    No hay productos disponibles en esta categoría.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = `
            <div class="row row-cols-1 row-cols-md-3 g-4">
                ${productosFiltrados.map(producto => 
                    ComponentsManager.createProductCard(producto)
                ).join('')}
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('productos-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    ${message}
                </div>
            `;
        }
        this.uiService.showMessage(message, 'danger');
    }
}

export class ContactPage {
    constructor() {
        this.checkbox = document.getElementById('Vende');
        this.formSuperior = document.querySelector('.form-superior');
        this.formInferior = document.querySelector('.form-inferior');
        this.httpService = new HttpService();
        this.uiService = new UIService();
        this.init();
    }

    init() {
        if (!this.checkbox || !this.formSuperior || !this.formInferior) return;
        
        this.initializeFormToggle();
        this.initializeFormSubmissions();
        document.body.classList.add(FORM_CONFIG.backgrounds.urgent);
    }

    initializeFormToggle() {
        this.checkbox.addEventListener('change', () => {
            if (this.checkbox.checked) {
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

    initializeFormSubmissions() {
        this.formSuperior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formSuperior));
        this.formInferior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formInferior));
    }

    async handleSubmit(e, form) {
        e.preventDefault();
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
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Determinar qué página estamos viendo basado en el data-page en el body
    const page = document.body.dataset.page;
    
    if (page === 'productos') {
        new ProductosVista();
    } else if (page === 'contacto') {
        new ContactPage();
    }
});
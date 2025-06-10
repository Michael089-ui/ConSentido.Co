import { ComponentsManager } from './components.js';
import { ProductService } from '../services/customer/product_services.js';
import { HttpService } from '../services/http-service.js';
import { UIService } from '../services/ui-service.js';
import { AuthService } from '../services/auth-service.js';
import { CustomerCartService } from '../services/customer/cart_services.js';

// Configuración de formularios y endpoints
const FORM_CONFIG = {
    backgrounds: {
        urgent: 'bg-contact-urgent',
        light: 'bg-contact-light'
    },
    endpoints: {
        contact: '/api/contacto',
        vendor: '/api/proveedores'
    }
};

/**
 * Clase para gestionar la vista de productos por categoría
 */
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
            // Mostrar indicador de carga
            const container = document.getElementById('productos-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center p-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando productos...</p>
                    </div>
                `;
            }
            
            // Obtener productos según la categoría seleccionada
            if (this.categoria && this.categoria !== 'todos') {
                this.productos = await this.productService.getProductsByCategory(this.categoria);
            } else {
                this.productos = await this.productService.getAllProducts();
            }
            
            this.mostrarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.showError('No se pudieron cargar los productos. Por favor intente nuevamente.');
        }
    }

    mostrarProductos() {
        const contenedor = document.getElementById('productos-container');
        if (!contenedor) return;

        // Filtrar productos según la categoría (adaptado para Spring Boot)
        let productosFiltrados = this.productos;
        
        if (this.categoria && this.categoria !== 'todos') {
            // Manejar tanto objetos de categoría como strings
            productosFiltrados = this.productos.filter(producto => {
                if (!producto) return false;
                
                // Caso 1: producto.categoria es un objeto con id y nombre
                if (producto.categoria && typeof producto.categoria === 'object') {
                    return (producto.categoria.id == this.categoria || 
                           producto.categoria.nombre?.toLowerCase() === this.categoria.toLowerCase());
                }
                
                // Caso 2: producto.categoria es el nombre de la categoría
                if (typeof producto.categoria === 'string') {
                    return producto.categoria.toLowerCase() === this.categoria.toLowerCase();
                }
                
                // Caso 3: producto.categoriaId es el ID de la categoría
                if (producto.categoriaId) {
                    return producto.categoriaId == this.categoria;
                }
                
                return false;
            });
        }

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay productos disponibles en esta categoría.
                </div>
            `;
            return;
        }

        // Ordenar productos por algún criterio (ej: más nuevos primero)
        productosFiltrados.sort((a, b) => {
            return (b.id || b.idProducto || 0) - (a.id || a.idProducto || 0);
        });

        contenedor.innerHTML = `
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                ${productosFiltrados.map(producto => 
                    ComponentsManager.createProductCard(producto)
                ).join('')}
            </div>
        `;

        // Inicializar botones de agregar al carrito
        this.initAddToCartButtons();
    }

    initAddToCartButtons() {
        const addButtons = document.querySelectorAll('.btn-agregar-carrito');
        addButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const productId = button.dataset.id;
                
                try {
                    const authService = new AuthService();
                    const isAuthenticated = await authService.isAuthenticated();
                    
                    if (!isAuthenticated) {
                        // Guardar la URL actual para redirigir después del login
                        const currentPage = encodeURIComponent(window.location.href);
                        window.location.href = `/pages/customer/Login.html?redirect=${currentPage}`;
                        return;
                    }
                    
                    const cartService = new CustomerCartService();
                    await cartService.addToCart({
                        producto_id: productId,
                        cantidad: 1
                    });
                    
                    // Actualizar contador del carrito
                    await ComponentsManager.updateCartCounter();
                    
                    this.uiService.showMessage('Producto agregado al carrito', 'success');
                } catch (error) {
                    console.error('Error al agregar al carrito:', error);
                    this.uiService.showMessage('Error al agregar producto al carrito', 'danger');
                }
            });
        });
    }

    showError(message) {
        const container = document.getElementById('productos-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Reintentar
                </button>
            `;
        }
        this.uiService.showMessage(message, 'danger');
    }
}

/**
 * Clase para gestionar la página de contacto y sus formularios
 */
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
        this.initializeFormValidation();
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

    initializeFormValidation() {
        // Aplicar validación Bootstrap a todos los formularios
        const forms = document.querySelectorAll('.needs-validation');
        forms.forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }

    initializeFormSubmissions() {
        this.formSuperior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formSuperior));
        this.formInferior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formInferior));
    }

    async handleSubmit(e, form) {
        e.preventDefault();
        
        // Validar formulario con validación HTML5
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Mostrar indicador de carga
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Enviando...
            `;
        }
        
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
            form.classList.remove('was-validated');
            this.showSuccessModal();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.uiService.showMessage(
                'Error al enviar el formulario. Por favor intente nuevamente.', 
                'danger'
            );
        } finally {
            // Restaurar botón
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar';
            }
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
                    class: 'btn-primary',
                    callback: () => window.location.href = '/index.html'
                }
            ],
            onClose: () => window.location.href = '/index.html'
        };
        
        this.uiService.createModal(modalConfig).show();
    }
}

/**
 * Clase para gestionar la página de búsqueda
 */
export class SearchPage {
    constructor() {
        this.productService = new ProductService();
        this.uiService = new UIService();
        this.searchQuery = new URLSearchParams(window.location.search).get('q');
        this.resultsContainer = document.getElementById('search-results');
        this.searchTermElement = document.getElementById('search-term');
        
        this.init();
    }
    
    async init() {
        if (this.searchTermElement && this.searchQuery) {
            this.searchTermElement.textContent = this.searchQuery;
        }
        
        await this.performSearch();
    }
    
    async performSearch() {
        if (!this.searchQuery || !this.resultsContainer) return;
        
        try {
            // Mostrar indicador de carga
            this.resultsContainer.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Buscando...</span>
                    </div>
                    <p class="mt-2">Buscando "${this.searchQuery}"...</p>
                </div>
            `;
            
            // Realizar la búsqueda usando el servicio
            const results = await this.productService.searchProductsByKeyword(this.searchQuery);
            
            if (!results || results.length === 0) {
                this.resultsContainer.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-search me-2"></i>
                        No se encontraron resultados para "${this.searchQuery}".
                    </div>
                    <p>Sugerencias:</p>
                    <ul>
                        <li>Revisa la ortografía de tu búsqueda</li>
                        <li>Intenta con palabras más generales</li>
                        <li>Prueba otra categoría de productos</li>
                    </ul>
                `;
                return;
            }
            
            // Mostrar resultados
            this.resultsContainer.innerHTML = `
                <p>Se encontraron ${results.length} resultados para "${this.searchQuery}"</p>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                    ${results.map(producto => 
                        ComponentsManager.createProductCard(producto)
                    ).join('')}
                </div>
            `;
            
            // Inicializar botones de carrito
            const addButtons = this.resultsContainer.querySelectorAll('.btn-agregar-carrito');
            addButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const productId = button.dataset.id;
                    await ComponentsManager.addToCart(productId, 1);
                });
            });
            
        } catch (error) {
            console.error('Error al realizar búsqueda:', error);
            this.resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al realizar la búsqueda. Por favor, intente nuevamente.
                </div>
            `;
            this.uiService.showMessage('Error al realizar la búsqueda', 'danger');
        }
    }
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Determinar qué página estamos viendo basado en el data-page en el body
    const page = document.body.dataset.page;
    
    switch(page) {
        case 'productos':
            new ProductosVista();
            break;
        case 'contacto':
            new ContactPage();
            break;
        case 'busqueda':
            new SearchPage();
            break;
    }
});
// Importación de servicios necesarios
import { ProductService } from '../services/customer/product_services.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { UIService } from '../services/ui-service.js';
import { AuthService } from '../services/auth_services.js';
import { ComponentsManager } from './components.js';

export class ProductsManager {
    constructor() {
        // Instanciar los servicios necesarios
        this.dataService = new ProductService();
        this.cartService = new CustomerCartService();
        this.uiService = new UIService();
        this.authService = new AuthService();
        this.initializeCartCounter();
    }

    async init() {
        try {
            // Cargar productos y configurar eventos
            await this.loadProducts();
            this.setupEventListeners();
            await this.updateCartCounter();
            
            // Asegurar que exista el modal para detalles de productos
            this.ensureModalExists();
        } catch (error) {
            console.error('Error initializing products:', error);
        }
    }

    async loadProducts() {
        try {
            const category = this.getCurrentCategory();
            const productsContainer = document.getElementById('productos-grid');

            if (!productsContainer) return;

            // Cargar productos según la categoría
            const products = category ?
                await this.dataService.getProductsByCategory(category) :
                await this.dataService.getAllProducts();

            // Mostrar mensaje si no hay productos
            if (!products || products.length === 0) {
                this.showEmptyState(productsContainer);
                return;
            }

            // Renderizar las tarjetas de productos
            productsContainer.innerHTML = products
                .map(product => this.createProductCard(product))
                .join('');
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('No se pudieron cargar los productos');
        }
    }

    getCurrentCategory() {
        // Obtener la categoría desde el atributo data del body
        const body = document.querySelector('body');
        return body?.dataset.categoria;
    }

    createProductCard(product) {
        // Crear HTML de la tarjeta de producto
        return `
            <div class="col">
                <div class="card h-100 producto-card">
                    <img src="${product.imagen}" 
                         class="card-img-top producto-img" 
                         alt="${product.nombre}"
                         style="height: 250px; object-fit: cover; cursor: pointer"
                         onclick='productosManager.showProductDetail(${JSON.stringify(product).replace(/"/g, '&quot;')})'>
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">${product.descripcion?.substring(0, 100) || ''}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${product.precio?.toLocaleString()}</span>
                            <button class="btn btn-warning btn-agregar-carrito" 
                                    data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Configurar delegación de eventos para botones de agregar al carrito
        document.addEventListener('click', (e) => {
            const addButton = e.target.closest('.btn-agregar-carrito');
            if (addButton) {
                e.preventDefault();
                const productId = addButton.dataset.id;
                this.addToCart(productId);
            }
        });
    }

    // Asegurar que exista el modal para detalles de producto
    ensureModalExists() {
        if (!document.getElementById('productDetailModal')) {
            this.uiService.createModal({
                id: 'productDetailModal',
                title: 'Detalle del Producto',
                size: 'modal-lg',
                content: '<div id="productDetailContent"></div>'
            });
        }
    }

    async showProductDetail(product) {
        try {
            const modalContent = document.getElementById('productDetailContent');
            if (!modalContent) return;

            // Crear contenido del modal con detalles del producto
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${product.imagen}" class="img-fluid rounded" alt="${product.nombre}">
                    </div>
                    <div class="col-md-6">
                        <h3>${product.nombre}</h3>
                        <p class="text-muted mb-4">${product.categoria || 'Sin categoría'}</p>
                        <p>${product.descripcion || 'Sin descripción disponible'}</p>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4 class="mb-0">$${(product.precio || 0).toLocaleString()}</h4>
                            <span class="badge bg-${product.stock > 5 ? 'success' : 'warning'}">
                                Stock: ${product.stock || 0} unidades
                            </span>
                        </div>
                        <button class="btn btn-warning w-100 btn-agregar-carrito" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            `;

            // Mostrar modal usando bootstrap
            const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
            modal.show();
        } catch (error) {
            console.error('Error al mostrar detalles del producto:', error);
            this.showMessage('No se pudieron cargar los detalles del producto', 'danger');
        }
    }

    async addToCart(productId) {
        try {
            // Verificar si el usuario está autenticado
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                window.location.href = '/pages/customer/Login.html?redirect=cart';
                return;
            }

            // Agregar producto al carrito
            await this.cartService.addToCart({
                producto_id: productId,
                cantidad: 1
            });

            // Actualizar contador del carrito
            await ComponentsManager.updateCartCounter();
            
            // Mostrar mensaje de éxito
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    async updateCartCounter() {
        await ComponentsManager.updateCartCounter();
    }

    showMessage(message, type) {
        this.uiService.showMessage(message, type);
    }

    initializeCartCounter() {
        const cartIcon = document.querySelector('.nav-icon i.fa-shopping-cart');
        if (cartIcon && !document.querySelector('.cart-counter')) {
            const counter = document.createElement('span');
            counter.className = 'cart-counter';
            cartIcon.parentElement.appendChild(counter);
        }
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay productos disponibles en esta categoría.</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('productos-grid');
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

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.productosManager = new ProductsManager();
    productosManager.init().catch(console.error);
});
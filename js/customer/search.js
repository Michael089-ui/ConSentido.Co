import { ProductService } from '../services/customer/product_services.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { AuthService } from '../services/auth_services.js';
import { UIService } from '../services/ui-service.js';
import { ComponentsManager } from './components.js';

export class SearchManager {
    constructor() {
        // Inicializar servicios
        this.dataService = new ProductService();
        this.cartService = new CustomerCartService();
        this.authService = new AuthService();
        this.uiService = new UIService();
        
        // Estado interno
        this.currentResults = []; // Guardar resultados de búsqueda
        this.currentCategoryFilter = null; // Categoría seleccionada para filtrar
        
        // Inicializar componente
        this.init();
    }

    async init() {
        // Obtener término de búsqueda de la URL
        this.searchTerm = new URLSearchParams(window.location.search).get('q') || '';
        
        if (this.searchTerm) {
            await this.performSearch(this.searchTerm);
        }

        // Configurar listener para el filtro por categoría
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategoryFilter = e.target.value || null;
                this.applyCategoryFilter();
            });
        }

        // Asegurar que exista el modal para detalles de productos
        this.ensureModalExists();

        // Configurar delegación de eventos para botones del carrito
        this.setupEventListeners();
    }

    // Crear modal para detalles de producto si no existe
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

    // Configurar listeners de eventos delegados
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Delegación para botones de agregar al carrito
            const addButton = e.target.closest('.btn-agregar-carrito');
            if (addButton) {
                e.preventDefault();
                const productId = addButton.dataset.id;
                this.addToCart(productId);
            }
        });
    }

    // Realizar la búsqueda usando el servicio de productos
    async performSearch(query) {
        try {
            this.currentResults = await this.dataService.searchProductsByKeyword(query);
            this.currentCategoryFilter = null; // Resetear filtro de categoría
            this.updateSearchStats(query, this.currentResults.length);
            this.renderResults(this.currentResults);
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            this.showError('Error al realizar la búsqueda');
        }
    }

    // Aplicar filtro de categoría a los resultados
    applyCategoryFilter() {
        if (!this.currentCategoryFilter) {
            // Sin filtro, mostrar todos los resultados de la búsqueda
            this.renderResults(this.currentResults);
            this.updateSearchStats(this.searchTerm, this.currentResults.length);
            return;
        }

        // Filtrar localmente por categoría
        const filtered = this.currentResults.filter(producto => 
            producto.categoria?.toLowerCase() === this.currentCategoryFilter.toLowerCase()
        );

        this.renderResults(filtered);
        this.updateSearchStats(this.searchTerm, filtered.length);
    }

    // Actualizar estadísticas de resultados en la UI
    updateSearchStats(query, count) {
        const statsElement = document.getElementById('search-stats');
        if (statsElement) {
            if (count > 0) {
                statsElement.textContent = `Se encontraron ${count} resultado(s) para "${query}"`;
            } else {
                statsElement.textContent = `No se encontraron resultados para "${query}"`;
            }
        }
    }

    // Renderizar los resultados de búsqueda
    renderResults(productos) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (productos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="lead">No encontramos productos que coincidan con tu búsqueda</p>
                    <a href="/index.html" class="btn btn-warning mt-3">Volver al inicio</a>
                </div>`;
            return;
        }

        container.innerHTML = productos.map(producto => this.createProductCard(producto)).join('');
    }

    // Crear una tarjeta de producto HTML
    createProductCard(producto) {
        return `
            <div class="col">
                <div class="card h-100 producto-card">
                    <img src="${producto.imagen}"
                         class="card-img-top producto-img"
                         alt="${producto.nombre}"
                         style="height: 250px; object-fit: cover; cursor: pointer"
                         onclick="searchManager.showProductDetail('${producto.id}')">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">${producto.descripcion?.substring(0, 100) || ''}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${producto.precio?.toLocaleString()}</span>
                            <button class="btn btn-warning btn-agregar-carrito" data-id="${producto.id}">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mostrar detalles de un producto en un modal
    async showProductDetail(productId) {
        try {
            // Obtener el producto completo desde el servicio
            const product = await this.dataService.getProductById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            
            const modalContent = document.getElementById('productDetailContent');
            if (!modalContent) return;

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

            const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
            modal.show();
        } catch (error) {
            console.error('Error al mostrar detalles del producto:', error);
            this.showMessage('No se pudieron cargar los detalles del producto', 'danger');
        }
    }

    // Agregar producto al carrito
    async addToCart(productId) {
        try {
            // Verificar autenticación del usuario
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                window.location.href = '/pages/customer/Login.html?redirect=cart';
                return;
            }

            // Agregar al carrito usando el servicio
            await this.cartService.addToCart({
                producto_id: productId,
                cantidad: 1
            });
            
            // Actualizar contador del carrito
            await ComponentsManager.updateCartCounter();
            
            // Mensaje de éxito
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    // Mostrar mensajes usando UIService
    showMessage(message, type) {
        this.uiService.showMessage(message, type);
    }

    // Mostrar error en la página de resultados
    showError(message) {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        ${message}. Por favor intenta nuevamente.
                    </div>
                </div>`;
        }
        this.showMessage(message, 'danger');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});
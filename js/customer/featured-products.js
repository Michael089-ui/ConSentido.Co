// Importación de servicios necesarios para productos y carrito
import { ProductService } from '../services/customer/product_services.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { ComponentsManager } from './components.js';

export class FeaturedProductsManager {
    // Constructor que inicializa los servicios necesarios
    constructor() {
        // Servicios para acceder a productos y manejar el carrito
        this.productService = new ProductService();
        this.cartService = new CustomerCartService();
        
        // Iniciar la carga de productos
        this.init();
    }

    // Método de inicialización que carga los productos destacados
    async init() {
        try {
            // Cargar los productos destacados (los más recientes)
            await this.loadFeaturedProducts();
            
            // Configurar los event listeners para la interacción
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando productos destacados:', error);
            this.showError();
        }
    }

    // Método para cargar productos destacados
    async loadFeaturedProducts() {
        try {
            // Obtener productos destacados desde el servicio específico
            const productos = await this.productService.getFeaturedProducts();
            
            // Renderizar los productos en la interfaz
            this.renderProducts(productos);
        } catch (error) {
            console.error('Error cargando productos destacados:', error);
            this.showError();
        }
    }

    // Método para renderizar los productos en la interfaz
    renderProducts(productos) {
        const container = document.querySelector('.productos-destacados .row');
        if (!container) return;

        // Mostrar mensaje si no hay productos disponibles
        if (!productos || productos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No hay productos destacados disponibles.</p>
                </div>
            `;
            return;
        }

        // Crear tarjetas de productos usando el componente reutilizable
        container.innerHTML = productos.map(producto => 
            ComponentsManager.createProductCard(producto)
        ).join('');

        // Asegurar que el modal de detalles exista
        this.ensureModalExists();
    }

    // Método para asegurar que el modal de detalles exista en el DOM
    ensureModalExists() {
        if (!document.getElementById('productDetailModal')) {
            document.body.insertAdjacentHTML('beforeend', this.createModal());
        }
    }

    // Método para crear el HTML del modal de detalles
    createModal() {
        return `
            <div class="modal fade" id="productDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalle del Producto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="productDetailContent">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Método para configurar los event listeners
    setupEventListeners() {
        // Delegación de eventos para los botones de agregar al carrito
        document.addEventListener('click', (e) => {
            const addButton = e.target.closest('.btn-agregar-carrito');
            if (addButton) {
                const productId = addButton.dataset.id;
                if (productId) {
                    this.addToCart(productId);
                }
            }
        });

        // Delegación de eventos para los clics en las imágenes de productos
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.producto-img');
            if (productCard) {
                const productId = productCard.closest('.card').querySelector('.btn-agregar-carrito').dataset.id;
                if (productId) {
                    this.showProductDetail(productId);
                }
            }
        });
    }

    // Método para mostrar los detalles de un producto
    async showProductDetail(productId) {
        try {
            // Obtener los detalles del producto desde el servicio
            const product = await this.productService.getProductById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const modalContent = document.getElementById('productDetailContent');
            if (!modalContent) return;

            // Crear el contenido del modal con los detalles del producto
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

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
            modal.show();
        } catch (error) {
            console.error('Error al mostrar detalles del producto:', error);
            this.showMessage('No se pudieron cargar los detalles del producto', 'danger');
        }
    }

    // Método para agregar un producto al carrito
    async addToCart(productId) {
        try {
            // Usar el servicio específico del carrito para agregar el producto
            await this.cartService.addToCart({
                producto_id: productId,
                cantidad: 1
            });
            
            // Actualizar el contador del carrito
            await ComponentsManager.updateCartCounter();
            
            // Mostrar mensaje de éxito
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            this.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    // Método para mostrar mensajes de alerta
    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Método para mostrar un mensaje de error cuando no se pueden cargar los productos
    showError() {
        const container = document.querySelector('.productos-destacados .row');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        Error al cargar los productos destacados. Por favor, intenta nuevamente.
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo y exponer globalmente
window.featuredProductsManager = new FeaturedProductsManager();
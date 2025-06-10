// Importo el servicio que me permite acceder a productos desde la API
import { product_services } from '../services/customer/product_services.js';
// Importo el servicio que me permite manejar el carrito desde la API
import { CustomerCartService } from '../services/customer/cart_services.js';

export class ProductsManager {
    constructor() {
        // Instancio los servicios de productos y carrito para poder usarlos en este archivo
        this.dataService = new ProductService();
        this.cartService = new CustomerCartService();
        this.initializeCartCounter();
    }

    async init() {
        // Cargo los productos al iniciar la página y configuro los eventos
        await this.loadProducts();
        this.setupEventListeners();
        this.updateCartCounterFromApi(); // Actualizo el contador de carrito directamente desde el backend
    }

    async loadProducts() {
        try {
            const category = this.getCurrentCategory();
            const productsContainer = document.getElementById('productos-grid');

            if (!productsContainer) return;

            // Según la categoría actual cargo todos los productos o los de esa categoría
            const products = category ?
                await this.dataService.getProductsByCategory(category) :
                await this.dataService.getAllProducts();

            // Si no hay productos, muestro un mensaje vacío
            if (!products || products.length === 0) {
                this.showEmptyState(productsContainer);
                return;
            }

            // Renderizo las cards con los productos
            productsContainer.innerHTML = products
                .map(product => this.createProductCard(product))
                .join('');
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        }
    }

    getCurrentCategory() {
        // Obtengo la categoría actual desde el atributo del body (la página la define)
        const body = document.querySelector('body');
        return body?.dataset.categoria;
    }

    createProductCard(product) {
        // Creo el HTML de la tarjeta de producto
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
                            <button class="btn btn-warning add-to-cart" 
                                    data-product='${JSON.stringify(product)}'>
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Escucho los clics en los botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const product = JSON.parse(button.dataset.product);
                this.addToCart(product);
            }
        });
    }

    showProductDetail(product) {
        // Muestro un modal con la información detallada del producto
        const modalContent = document.getElementById('productDetailContent');

        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.imagen}" class="img-fluid rounded" alt="${product.nombre}">
                </div>
                <div class="col-md-6">
                    <h3>${product.nombre}</h3>
                    <p class="text-muted mb-4">${product.categoria}</p>
                    <p>${product.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="mb-0">$${product.precio?.toLocaleString()}</h4>
                        <span class="badge bg-${product.stock > 5 ? 'success' : 'warning'}">
                            Stock: ${product.stock} unidades
                        </span>
                    </div>
                    <button class="btn btn-warning w-100 add-to-cart" 
                            data-product='${JSON.stringify(product)}'>
                        <i class="fas fa-shopping-cart"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
        modal.show();
    }

    async addToCart(product) {
        try {
            // Envío el producto al backend para que lo agregue al carrito
            await this.cartService.addToCart({ producto_id: product.id, cantidad: 1 });

            // Actualizo el contador del carrito y muestro mensaje
            await this.updateCartCounterFromApi();
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.showMessage('Hubo un error al agregar el producto', 'danger');
        }
    }

    async updateCartCounterFromApi() {
        try {
            // Traigo el carrito desde el backend y sumo las cantidades de productos
            const cart = await this.cartService.getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

            const counter = document.querySelector('.cart-counter');
            if (counter) {
                counter.textContent = totalItems;
                counter.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('No se pudo actualizar el contador del carrito:', error);
        }
    }

    showMessage(message, type) {
        // Muestro un mensaje tipo alerta en la pantalla
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

    initializeCartCounter() {
        // Inserto el contador visual en el ícono del carrito (si no existe)
        const cartIcon = document.querySelector('.nav-icon i.fa-shopping-cart');
        if (cartIcon && !document.querySelector('.cart-counter')) {
            const counter = document.createElement('span');
            counter.className = 'cart-counter';
            cartIcon.parentElement.appendChild(counter);
        }
    }

    showEmptyState(container) {
        // Si no hay productos en la categoría actual, muestro este mensaje
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay productos disponibles en esta categoría.</p>
            </div>
        `;
    }
}

// Expongo el manager globalmente para usarlo en los modales
window.productosManager = new ProductsManager();

// Inicio el manager cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    productosManager.init().catch(console.error);
});

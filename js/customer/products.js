import { DataService } from '../services/data-services.js';

export class ProductsManager {
    constructor() {
        this.dataService = new DataService();
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Esto me permite alamcenar la imagen del producto que se guarda en el local
        this.productImages = JSON.parse(localStorage.getItem('productImages') || '{}');
        this.initializeCartCounter();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.initializeCartCounter();
    }

    async loadProducts() {
        try {
            const category = this.getCurrentCategory();
            const productsContainer = document.getElementById('productos-grid');

            if (!productsContainer) return;

            const products = category ?
                await this.dataService.getProductsByCategory(category) :
                await this.dataService.getAllProducts();

            if (products.length === 0) {
                this.showEmptyState(productsContainer);
                return;
            }

            productsContainer.innerHTML = products
                .map(product => this.createProductCard(product))
                .join('');
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        }
    }

    getCurrentCategory() {
        const body = document.querySelector('body');
        return body?.dataset.categoria;
    }

    createProductCard(product) {
        const imageSrc = this.productImages[product.imagen] || product.imagen;
        
        return `
            <div class="col">
                <div class="card h-100 producto-card">
                    <img src="${imageSrc}" 
                         class="card-img-top producto-img" 
                         alt="${product.nombre}"
                         style="height: 250px; object-fit: cover; cursor: pointer"
                         onclick="productosManager.showProductDetail(${JSON.stringify(product).replace(/"/g, '&quot;')})">
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
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const product = JSON.parse(button.dataset.product);
                this.addToCart(product);
            }
        });
    }

    showProductDetail(product) {
        const modalContent = document.getElementById('productDetailContent');
        const imageSrc = this.productImages[product.imagen] || product.imagen;
        
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${imageSrc}" class="img-fluid rounded" alt="${product.nombre}">
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

    addToCart(product) {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Verificar si el producto ya está en el carrito
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.cantidad += 1;
            } else {
                cart.push({
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    cantidad: 1,
                    imagen: product.imagen
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCartCounter();
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            this.showMessage('Error al agregar al carrito', 'danger');
        }
    }

    updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

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

    initializeCartCounter() {
        // Asegurarse de que el contador existe
        const cartIcon = document.querySelector('.nav-icon i.fa-shopping-cart');
        if (cartIcon && !document.querySelector('.cart-counter')) {
            const counter = document.createElement('span');
            counter.className = 'cart-counter';
            cartIcon.parentElement.appendChild(counter);
            this.updateCartCounter();
        }
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay productos disponibles en esta categoría.</p>
            </div>
        `;
    }
}
window.productosManager = new ProductsManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const productosManager = new ProductsManager();
    productosManager.init().catch(console.error);  // Manejar errores de init
});
import { DataService } from '../services/data-services.js';

export class ProductsManager {
    constructor() {
        this.dataService = new DataService();
    }

    init() {
        this.loadProducts();
    }

    loadProducts() {
        const category = this.getCurrentCategory();
        const productsContainer = document.getElementById('productos-grid');
        
        if (!productsContainer) return;

        const products = category ? 
            this.dataService.getProductsByCategory(category) : 
            this.dataService.getAllProducts();

        if (products.length === 0) {
            this.showEmptyState(productsContainer);
            return;
        }

        productsContainer.innerHTML = products
            .map(product => this.createProductCard(product))
            .join('');
    }

    getCurrentCategory() {
        const body = document.querySelector('body');
        return body?.dataset.categoria;
    }

    createProductCard(product) {
        return `
            <div class="col">
                <div class="card h-100 producto-card">
                    <img src="${product.imagen}" 
                         class="card-img-top producto-img" 
                         alt="${product.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">${product.descripcion}</p>
                        <p class="card-text">
                            <small class="text-muted">Stock: ${product.stock} unidades</small>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${product.precio.toLocaleString()}</span>
                            <button class="btn btn-warning" onclick="agregarAlCarrito(${product.id})">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay productos disponibles en esta categoría.</p>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const productosManager = new ProductsManager();
    productosManager.init();
});
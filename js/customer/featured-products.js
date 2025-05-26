import { DataService } from '../services/data-services.js';

class FeaturedProducts {
    constructor() {
        this.dataService = new DataService();
        this.productImages = JSON.parse(localStorage.getItem('productImages') || '{}');
        this.init();
    }

    async init() {
        try {
            const productos = await this.dataService.getAllProducts();
            
            // Ordenar productos por fecha de creación (más recientes primero)
            const productosOrdenados = productos.sort((a, b) => {
                return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
            });

            // Tomar solo los últimos 3 productos
            const productosDestacados = productosOrdenados.slice(0, 3);
            
            this.renderProductos(productosDestacados);
            this.setupEventListeners();
        } catch (error) {
            console.error('Error cargando productos destacados:', error);
            this.mostrarError();
        }
    }

    renderProductos(productos) {
        const container = document.querySelector('.productos-destacados .row');
        if (!container) return;

        if (productos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No hay productos destacados disponibles.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productos.map(producto => this.createProductCard(producto)).join('');

        // Agregar modal al body si no existe
        if (!document.getElementById('productDetailModal')) {
            document.body.insertAdjacentHTML('beforeend', this.createModal());
        }
    }

    createProductCard(producto) {
        const imageSrc = this.productImages[producto.imagen] || producto.imagen;
        
        return `
            <div class="col-md-4">
                <div class="card h-100 producto-card">
                    <img src="${imageSrc}" 
                         class="card-img-top producto-img" 
                         alt="${producto.nombre}"
                         style="height: 250px; object-fit: cover; cursor: pointer"
                         onclick='featuredProducts.showProductDetail(${JSON.stringify(producto)})'>
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">${producto.descripcion?.substring(0, 100) || ''}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${producto.precio?.toLocaleString()}</span>
                            <button class="btn btn-warning add-to-cart" 
                                    data-product='${JSON.stringify(producto)}'>
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

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
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.cantidad += 1;
        } else {
            cart.push({
                ...product,
                cantidad: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.showMessage('Producto agregado al carrito', 'success');
        
        // Actualizar contador del carrito
        const counter = document.querySelector('.cart-counter');
        if (counter) {
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

    mostrarError() {
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
window.featuredProducts = new FeaturedProducts();
document.addEventListener('DOMContentLoaded', () => {
    new FeaturedProducts();
});
// filepath: c:\Users\chave\Bootcamp\ConSentido.Co\js\customer\search.js
import { DataService } from '../services/data-services.js';

class SearchManager {
    constructor() {
        this.dataService = new DataService();
        this.productImages = JSON.parse(localStorage.getItem('productImages') || '{}');
        this.init();
    }

    async init() {
        this.searchTerm = new URLSearchParams(window.location.search).get('q') || '';
        if (this.searchTerm) {
            await this.performSearch(this.searchTerm);
        }
    }

    async performSearch(query) {
        try {
            const productos = await this.dataService.getAllProducts();
            const resultados = this.filterProducts(productos, query);
            this.updateSearchStats(query, resultados.length);
            this.renderResults(resultados);
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            this.showError();
        }
    }

    filterProducts(productos, query) {
        const searchTerm = query.toLowerCase();
        return productos.filter(producto => {
            return (
                producto.nombre?.toLowerCase().includes(searchTerm) ||
                producto.descripcion?.toLowerCase().includes(searchTerm) ||
                producto.categoria?.toLowerCase().includes(searchTerm)
            );
        });
    }

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

    renderResults(productos) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (productos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="lead">No encontramos productos que coincidan con tu búsqueda</p>
                    <a href="/index.html" class="btn btn-warning mt-3">
                        Volver al inicio
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = productos.map(producto => this.createProductCard(producto)).join('');
    }

    createProductCard(producto) {
        const imageSrc = this.productImages[producto.imagen] || producto.imagen;
        
        return `
            <div class="col">
                <div class="card h-100 producto-card">
                    <img src="${imageSrc}" 
                         class="card-img-top producto-img" 
                         alt="${producto.nombre}"
                         style="height: 250px; object-fit: cover; cursor: pointer"
                         onclick="searchManager.showProductDetail(${JSON.stringify(producto)})">
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

    showError() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        Error al realizar la búsqueda. Por favor intenta nuevamente.
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo
window.searchManager = new SearchManager();
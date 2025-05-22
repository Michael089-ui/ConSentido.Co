import { ComponentsManager } from './components.js';

export class ProductsManager {
    static async loadFeaturedProducts() {
        try {
            const response = await fetch('/api/productos/destacados');
            const productos = await response.json();
            const contenedor = document.querySelector('.productos-destacados .row');
            contenedor.innerHTML = productos.map(producto => 
                ComponentsManager.createProductCard(producto)
            ).join('');
        } catch (error) {
            console.error('Error al cargar productos destacados:', error);
        }
    }

    static viewProductDetails(id) {
        window.location.href = `/producto.html?id=${id}`;
    }
}

export const FORM_CONFIG = {
    endpoints: {
        contact: '/api/contact',
        vendor: '/api/vendor'
    },
    backgrounds: {
        urgent: 'fondo-urgente',
        light: 'fondo-claro'
    }
};
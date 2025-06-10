// Importación de componentes necesarios y servicios
import { ComponentsManager } from './components.js';
import { ProductService } from '../services/customer/product_services.js';

export class ProductsManager {
    // Constructor que inicializa los servicios necesarios
    constructor() {
        // Instancia del servicio de productos para clientes
        this.productService = new ProductService();
    }

    // Método para cargar productos destacados en la página de inicio
    async loadFeaturedProducts() {
        try {
            // Obtener productos destacados desde el servicio
            const productos = await this.productService.getFeaturedProducts();
            
            // Seleccionar el contenedor donde se mostrarán los productos
            const contenedor = document.querySelector('.productos-destacados .row');
            
            // Verificar que el contenedor exista antes de modificarlo
            if (contenedor) {
                // Generar las tarjetas de productos y agregarlas al contenedor
                contenedor.innerHTML = productos.map(producto => 
                    ComponentsManager.createProductCard(producto)
                ).join('');
                
                // Inicializar eventos para las tarjetas de productos
                this.initProductCardEvents();
            }
        } catch (error) {
            console.error('Error al cargar productos destacados:', error);
            this.showError('No se pudieron cargar los productos destacados');
        }
    }

    // Método para inicializar eventos en las tarjetas de productos
    initProductCardEvents() {
        // Agregar eventos de clic a los botones de "Ver detalles"
        document.querySelectorAll('.btn-ver-producto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.id;
                this.viewProductDetails(productId);
            });
        });

        // Agregar eventos de clic a los botones de "Agregar al carrito"
        document.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.id;
                ComponentsManager.addToCart(productId, 1);
            });
        });
    }

    // Método para redirigir a la página de detalles de un producto
    viewProductDetails(id) {
        window.location.href = `/pages/customer/producto.html?id=${id}`;
    }

    // Método para mostrar mensajes de error en la interfaz
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        
        const container = document.querySelector('.productos-destacados');
        if (container) {
            container.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
}

// Configuración para formularios en la aplicación
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

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    const productsManager = new ProductsManager();
    
    // Si estamos en la página de inicio, cargar productos destacados
    if (document.querySelector('.productos-destacados')) {
        productsManager.loadFeaturedProducts();
    }
});
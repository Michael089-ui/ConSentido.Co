// Importación de componentes necesarios y servicios
import { ComponentsManager } from './components.js';
import { ProductService } from '../services/customer/product_services.js';
import { UIService } from '../services/ui-service.js';
import { AuthService } from '../services/auth-service.js';
import { CustomerCartService } from '../services/customer/cart_services.js';

export class ProductsManager {
    // Constructor que inicializa los servicios necesarios
    constructor() {
        // Instancias de servicios requeridos
        this.productService = new ProductService();
        this.uiService = new UIService();
        this.authService = new AuthService();
        this.cartService = new CustomerCartService();
    }

    // Método para cargar productos destacados en la página de inicio
    async loadFeaturedProducts() {
        try {
            // Mostrar indicador de carga
            const contenedor = document.querySelector('.productos-destacados .row');
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando productos...</span>
                        </div>
                    </div>`;
            }
            
            // Obtener productos destacados desde el servicio
            const productos = await this.productService.getFeaturedProducts();
            
            // Verificar que haya productos para mostrar
            if (!productos || !Array.isArray(productos) || productos.length === 0) {
                if (contenedor) {
                    contenedor.innerHTML = `
                        <div class="col-12">
                            <div class="alert alert-info text-center">
                                <i class="fas fa-info-circle me-2"></i>
                                No hay productos destacados disponibles en este momento.
                            </div>
                        </div>`;
                }
                return;
            }
            
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
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const productId = btn.dataset.id;
                await this.addToCart(productId, 1);
            });
        });
    }

    // Método para redirigir a la página de detalles de un producto
    viewProductDetails(id) {
        if (!id) return;
        window.location.href = `/pages/customer/producto.html?id=${id}`;
    }

    // Método para agregar un producto al carrito
    async addToCart(productId, quantity = 1) {
        try {
            // Verificar si el usuario está autenticado
            const isAuthenticated = await this.authService.isAuthenticated();
            
            if (!isAuthenticated) {
                // Guardar la URL actual para redirigir después del login
                const currentPage = encodeURIComponent(window.location.href);
                window.location.href = `/pages/customer/Login.html?redirect=${currentPage}`;
                return;
            }
            
            // Mostrar indicador de carga en el botón
            const btn = document.querySelector(`.btn-agregar-carrito[data-id="${productId}"]`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...`;
                
                // Restaurar botón después de un tiempo
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }, 1500);
            }
            
            // Agregar al carrito usando el servicio
            await this.cartService.addToCart({
                producto_id: productId,
                cantidad: quantity
            });
            
            // Actualizar contador del carrito
            await ComponentsManager.updateCartCounter();
            
            // Mostrar mensaje de éxito
            this.uiService.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            this.uiService.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    // Método para mostrar mensajes de error en la interfaz
    showError(message) {
        // Usar UIService para mostrar mensaje estándar
        this.uiService.showMessage(message, 'danger');
        
        // También mostrar en el contenedor de productos
        const container = document.querySelector('.productos-destacados .row');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${message}
                        <button class="btn btn-sm btn-outline-danger float-end" onclick="location.reload()">
                            <i class="fas fa-sync-alt me-1"></i>Reintentar
                        </button>
                    </div>
                </div>`;
        }
    }
}

// Configuración para formularios en la aplicación
export const FORM_CONFIG = {
    endpoints: {
        contact: '/api/contacto',
        vendor: '/api/proveedores'
    },
    backgrounds: {
        urgent: 'bg-danger-subtle',
        light: 'bg-light'
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
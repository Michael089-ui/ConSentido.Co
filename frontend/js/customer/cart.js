// Importación de servicios necesarios para órdenes y carrito
import { OrderService } from '../services/customer/orders_services.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { AuthService } from '../services/auth-service.js';
import { UIService } from '../services/ui-service.js';

export class CartManager {
    // Constructor que inicializa los servicios necesarios y el estado del carrito
    constructor() {
        // Instanciamos los servicios para órdenes, carrito y autenticación
        this.orderService = new OrderService();
        this.cartService = new CustomerCartService();
        this.authService = new AuthService();
        this.uiService = new UIService();
        this.cart = []; // Carrito sincronizado con backend
        this.init();
    }

    // Inicializamos cargando el carrito desde backend y actualizando la UI
    async init() {
        try {
            await this.loadCartFromBackend();
            this.updateCartCounter();
            this.renderCart();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando carrito:', error);
            this.showMessage('Error al cargar el carrito', 'danger');
        }
    }

    // Obtengo el carrito del usuario actual desde el backend
    async loadCartFromBackend() {
        try {
            // Verificar si el usuario está autenticado
            const isAuthenticated = await this.authService.isAuthenticated();
            if (!isAuthenticated) {
                this.cart = [];
                return;
            }
            
            this.cart = await this.cartService.getCart();
            
            // Verificar que el carrito sea un array válido
            if (!Array.isArray(this.cart)) {
                console.warn('El carrito no es un array válido:', this.cart);
                this.cart = [];
            }
        } catch (error) {
            console.error('Error cargando carrito desde backend:', error);
            this.cart = []; // En caso de error, inicializo carrito vacío
        }
    }

    // Actualizo el contador visual del carrito en la interfaz
    updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            const totalItems = this.cart.reduce((sum, item) => sum + (item.cantidad || 0), 0);
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Renderizo los productos del carrito y el resumen en la interfaz
    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const summaryContainer = document.getElementById('cart-summary');
        
        if (!cartContainer || !summaryContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                    <p class="lead">Tu carrito está vacío</p>
                    <a href="/" class="btn btn-warning">Continuar comprando</a>
                </div>
            `;
            summaryContainer.innerHTML = '';
            return;
        }

        let total = 0;
        cartContainer.innerHTML = this.cart.map(item => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            const subtotal = precio * cantidad;
            total += subtotal;
            
            return `
                <div class="cart-item border-bottom py-3">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${item.imagen || '/assets/images/product-placeholder.png'}" 
                                 alt="${item.nombre || 'Producto'}" 
                                 class="img-fluid rounded">
                        </div>
                        <div class="col">
                            <h5 class="mb-1">${item.nombre || 'Producto sin nombre'}</h5>
                            <p class="mb-1">$${precio.toLocaleString('es-CO')}</p>
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="cartManager.updateQuantity('${item.id}', ${cantidad - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-2">${cantidad}</span>
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="cartManager.updateQuantity('${item.id}', ${cantidad + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-3" 
                                        onclick="cartManager.removeItem('${item.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-auto">
                            <p class="h5 mb-0">$${subtotal.toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        summaryContainer.innerHTML = `
            <div class="p-3">
                <h5 class="border-bottom pb-2">Resumen del pedido</h5>
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>$${total.toLocaleString('es-CO')}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Envío</span>
                    <span>Gratis</span>
                </div>
                <div class="d-flex justify-content-between mb-3 fw-bold">
                    <span>Total</span>
                    <span>$${total.toLocaleString('es-CO')}</span>
                </div>
                <button class="btn btn-warning w-100" id="finalizeOrderBtn">
                    Finalizar Compra
                </button>
            </div>
        `;
        
        // Asignar evento usando addEventListener en lugar de onclick en el HTML
        document.getElementById('finalizeOrderBtn')?.addEventListener('click', () => this.finalizeOrder());
    }

    // Configuración de event listeners adicionales si se requieren
    setupEventListeners() {
        // Botón para vaciar el carrito
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                    try {
                        await this.cartService.clearCart();
                        await this.loadCartFromBackend();
                        this.renderCart();
                        this.updateCartCounter();
                        this.showMessage('Carrito vaciado correctamente', 'success');
                    } catch (error) {
                        console.error('Error al vaciar el carrito:', error);
                        this.showMessage('Error al vaciar el carrito', 'danger');
                    }
                }
            });
        }
    }

    // Actualizo la cantidad de un producto en el carrito y sincronizo con backend
    async updateQuantity(id, newQuantity) {
        if (newQuantity < 1) {
            await this.removeItem(id);
            return;
        }

        try {
            const producto = this.cart.find(item => item.id === id);
            if (!producto) return;

            // Mostrar indicador de carga
            this.showLoadingIndicator(true);

            // Usar el método updateQuantity específico en lugar de addToCart
            await this.cartService.updateQuantity(id, newQuantity);

            // Recargamos el carrito para mantener sincronía con backend
            await this.loadCartFromBackend();
            this.renderCart();
            this.updateCartCounter();
            
            // Ocultar indicador de carga
            this.showLoadingIndicator(false);
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            this.showMessage('Error al actualizar la cantidad', 'danger');
            this.showLoadingIndicator(false);
        }
    }

    // Elimino un producto del carrito y sincronizo con backend
    async removeItem(id) {
        try {
            // Mostrar indicador de carga
            this.showLoadingIndicator(true);
            
            await this.cartService.removeFromCart(id);
            await this.loadCartFromBackend();
            this.renderCart();
            this.updateCartCounter();
            this.showMessage('Producto eliminado del carrito', 'success');
            
            // Ocultar indicador de carga
            this.showLoadingIndicator(false);
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.showMessage('Error al eliminar el producto', 'danger');
            this.showLoadingIndicator(false);
        }
    }

    // Finalizo la orden enviando los datos al backend y limpio el carrito
    async finalizeOrder() {
        try {
            // Verifico si el usuario está autenticado usando el servicio
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                const currentPage = encodeURIComponent(window.location.pathname);
                window.location.href = `/pages/customer/Login.html?redirect=${currentPage}`;
                return;
            }
            
            // Verificar si hay productos en el carrito
            if (this.cart.length === 0) {
                this.showMessage('No hay productos en el carrito para realizar el pedido', 'warning');
                return;
            }

            // Mostrar indicador de carga
            this.showLoadingIndicator(true);

            // Preparo los datos de la orden
            const orderData = {
                usuario: {
                    id: currentUser.id,
                    nombre: currentUser.nombre,
                    email: currentUser.email,
                    telefono: currentUser.telefono || ''
                },
                productos: this.cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    precio: parseFloat(item.precio) || 0,
                    cantidad: parseInt(item.cantidad) || 0
                })),
                total: this.cart.reduce((sum, item) => sum + ((parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0)), 0),
                fecha: new Date().toISOString(),
                estado: 'pendiente',
                direccionEnvio: currentUser.direccion || '',
                metodoPago: 'whatsapp'
            };

            // Creo la orden en backend
            await this.orderService.createOrder(orderData);

            // Limpio el carrito en backend
            await this.cartService.clearCart();

            // Refresco el carrito local y la UI
            await this.loadCartFromBackend();
            this.updateCartCounter();
            this.renderCart();

            // Ocultar indicador de carga
            this.showLoadingIndicator(false);

            // Muestro modal de confirmación
            this.showWhatsAppModal();

        } catch (error) {
            console.error('Error finalizando orden:', error);
            this.showMessage('Error al procesar el pedido: ' + (error.message || 'Error en el servidor'), 'danger');
            this.showLoadingIndicator(false);
        }
    }

    // Muestra u oculta un indicador de carga durante las operaciones
    showLoadingIndicator(show) {
        let loadingOverlay = document.getElementById('cartLoadingOverlay');
        
        if (show) {
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'cartLoadingOverlay';
                loadingOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
                loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
                loadingOverlay.style.zIndex = '9999';
                loadingOverlay.innerHTML = `
                    <div class="bg-white p-3 rounded shadow-lg">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <span class="ms-2">Procesando...</span>
                    </div>
                `;
                document.body.appendChild(loadingOverlay);
            }
        } else if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Muestro modal de confirmación con mensaje y redirección
    showWhatsAppModal() {
        const modalHtml = `
            <div class="modal fade" id="whatsappModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">¡Pedido Confirmado!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <i class="fab fa-whatsapp text-success fa-3x mb-3"></i>
                            <h4>¡Gracias por tu compra!</h4>
                            <p>Hemos registrado tus datos correctamente.</p>
                            <p>Nos comunicaremos contigo por WhatsApp para coordinar el pago y el envío.</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-warning" data-bs-dismiss="modal">
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Usar bootstrap para mostrar el modal
        const modalElement = document.getElementById('whatsappModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Remuevo el modal del DOM al cerrarse y redirijo al inicio
        modalElement.addEventListener('hidden.bs.modal', function () {
            this.remove();
            window.location.href = '/';
        });
    }

    // Muestro mensajes temporales en pantalla para feedback al usuario
    showMessage(message, type) {
        // Usar UIService si está disponible
        if (this.uiService) {
            this.uiService.showMessage(message, type);
            return;
        }
        
        // Fallback si no hay UIService
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
}

// Inicializo y expongo globalmente para uso en la UI
window.cartManager = new CartManager();
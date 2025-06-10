// Importación de servicios necesarios para órdenes y carrito
import { OrderService } from '../services/customer/orders_services.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { AuthService } from '../services/auth_services.js';  // Corregido el path de importación

export class CartManager {
    // Constructor que inicializa los servicios necesarios y el estado del carrito
    constructor() {
        // Instanciamos los servicios para órdenes, carrito y autenticación
        this.orderService = new OrderService();
        this.cartService = new CustomerCartService();
        this.authService = new AuthService();
        this.cart = []; // Carrito sincronizado con backend
        this.init();
    }

    // Inicializamos cargando el carrito desde backend y actualizando la UI
    async init() {
        await this.loadCartFromBackend();
        this.updateCartCounter();
        this.renderCart();
        this.setupEventListeners();
    }

    // Obtengo el carrito del usuario actual desde el backend
    async loadCartFromBackend() {
        try {
            this.cart = await this.cartService.getCart();
        } catch (error) {
            console.error('Error cargando carrito desde backend:', error);
            this.cart = []; // En caso de error, inicializo carrito vacío
        }
    }

    // Actualizo el contador visual del carrito en la interfaz
    updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.cantidad, 0);
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
                    <a href="/index.html" class="btn btn-warning">Continuar comprando</a>
                </div>
            `;
            summaryContainer.innerHTML = '';
            return;
        }

        let total = 0;
        cartContainer.innerHTML = this.cart.map(item => {
            total += item.precio * item.cantidad;
            return `
                <div class="cart-item border-bottom py-3">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded">
                        </div>
                        <div class="col">
                            <h5 class="mb-1">${item.nombre}</h5>
                            <p class="mb-1">$${item.precio.toLocaleString()}</p>
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="cartManager.updateQuantity('${item.id}', ${item.cantidad - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-2">${item.cantidad}</span>
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="cartManager.updateQuantity('${item.id}', ${item.cantidad + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-3" 
                                        onclick="cartManager.removeItem('${item.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-auto">
                            <p class="h5 mb-0">$${(item.precio * item.cantidad).toLocaleString()}</p>
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
                    <span>$${total.toLocaleString()}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Envío</span>
                    <span>Gratis</span>
                </div>
                <div class="d-flex justify-content-between mb-3 fw-bold">
                    <span>Total</span>
                    <span>$${total.toLocaleString()}</span>
                </div>
                <button class="btn btn-warning w-100" onclick="cartManager.finalizeOrder()">
                    Finalizar Compra
                </button>
            </div>
        `;
    }

    // Configuración de event listeners adicionales si se requieren
    setupEventListeners() {
        // Por ahora no hay listeners adicionales
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

            // Usar el método updateQuantity específico en lugar de addToCart
            await this.cartService.updateQuantity(id, newQuantity);

            // Recargamos el carrito para mantener sincronía con backend
            await this.loadCartFromBackend();
            this.renderCart();
            this.updateCartCounter();
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            this.showMessage('Error al actualizar la cantidad', 'danger');
        }
    }

    // Elimino un producto del carrito y sincronizo con backend
    async removeItem(id) {
        try {
            await this.cartService.removeFromCart(id);
            await this.loadCartFromBackend();
            this.renderCart();
            this.updateCartCounter();
            this.showMessage('Producto eliminado del carrito', 'success');
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.showMessage('Error al eliminar el producto', 'danger');
        }
    }

    // Finalizo la orden enviando los datos al backend y limpio el carrito
    async finalizeOrder() {
        try {
            // Verifico si el usuario está autenticado usando el servicio
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                window.location.href = '/pages/customer/Login.html?redirect=cart';
                return;
            }

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
                    precio: item.precio,
                    cantidad: item.cantidad
                })),
                total: this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
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

            // Muestro modal de confirmación
            this.showWhatsAppModal();

        } catch (error) {
            console.error('Error finalizando orden:', error);
            this.showMessage('Error al procesar el pedido: ' + error.message, 'danger');
        }
    }

    // Muestro modal de confirmación con mensaje y redirección
    showWhatsAppModal() {
        const modalHtml = `
            <div class="modal fade" id="whatsappModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body text-center py-4">
                            <i class="fab fa-whatsapp text-success fa-3x mb-3"></i>
                            <h4>¡Gracias por tu compra!</h4>
                            <p>Hemos registrado tus datos correctamente.</p>
                            <p>Nos comunicaremos contigo por WhatsApp para coordinar el pago y el envío.</p>
                            <button class="btn btn-warning mt-3" onclick="window.location.href='/index.html'">
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
        modal.show();

        // Remuevo el modal del DOM al cerrarse y redirijo al inicio
        document.getElementById('whatsappModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
            window.location.href = '/index.html';
        });
    }

    // Muestro mensajes temporales en pantalla para feedback al usuario
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
}

// Inicializo y expongo globalmente para uso en la UI
window.cartManager = new CartManager();
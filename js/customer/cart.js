import { OrderService } from '../services/orders_services.js';

export class CartManager {
    constructor() {
        this.orderService = new OrderService();
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCounter();
        this.renderCart();
        this.setupEventListeners();
    }

    updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.cantidad, 0);
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

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

        // Modificar la parte del resumen
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

    setupEventListeners() {
        // Event listeners adicionales si son necesarios
    }

    updateQuantity(id, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(id);
            return;
        }
        
        const itemIndex = this.cart.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            this.cart[itemIndex].cantidad = newQuantity;
            this.saveCart();
            this.renderCart();
            this.updateCartCounter();
        }
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.renderCart();
        this.updateCartCounter();
        this.showMessage('Producto eliminado del carrito', 'success');
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    async finalizeOrder() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                window.location.href = '/pages/customer/Login.html?redirect=cart';
                return;
            }

            console.log('Iniciando finalización de orden...');
            
            const orderData = {
                id: Date.now().toString(),
                usuario: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    celular: currentUser.celular || ''
                },
                productos: this.cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad
                })),
                total: this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                fecha: new Date().toISOString(),
                estado: 'pendiente'
            };

            console.log('Orden preparada:', orderData);

            // Intentar crear la orden
            await this.orderService.createOrder(orderData);
            console.log('Orden creada exitosamente');
            
            // Limpiar carrito
            this.cart = [];
            this.saveCart();
            this.updateCartCounter();
            
            // Mostrar modal de confirmación
            this.showWhatsAppModal();
            
        } catch (error) {
            console.error('Error detallado:', error);
            this.showMessage('Error al procesar el pedido: ' + error.message, 'danger');
        }
    }

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

        // Remover el modal del DOM cuando se cierre
        document.getElementById('whatsappModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
            window.location.href = '/index.html';
        });
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
}

// Inicializar y exponer globalmente
window.cartManager = new CartManager();
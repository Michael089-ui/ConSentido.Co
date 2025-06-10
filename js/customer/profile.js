// Importa los servicios necesarios
import { UserServices } from '../services/customer/user_services.js';  // Servicio para usuario comprador
import { OrderService } from '../services/customer/orders_services.js'; // Servicio para pedidos
import { AuthService } from '../services/auth_services.js';

document.addEventListener('DOMContentLoaded', function() {
    new ProfileManager();
});

class ProfileManager {
    constructor() {
        // Instancia los servicios
        this.userService = new UserServices();
        this.authService = new AuthService();
        this.orderService = new OrderService();
        this.currentUser = null; // Usuario inicialmente no cargado
        this.init();
    }

    // Método para inicializar la carga de datos y eventos
    async init() {
        // Carga el perfil del usuario autenticado
        await this.loadCurrentUser();

        if (!this.currentUser) {
            // Si no hay usuario autenticado, redirige a login
            window.location.href = '/pages/customer/Login.html';
            return;
        }

        // Carga la información del perfil y los pedidos
        this.loadUserProfile();
        this.loadUserOrders();
        this.setupEventListeners();
    }

    // Obtiene la información del usuario autenticado desde backend
    async loadCurrentUser() {
        try {
            this.currentUser = await this.userService.getCurrentUser();
        } catch (error) {
            console.error('Error al cargar el usuario actual:', error);
            this.currentUser = null;
        }
    }

    // Renderiza la información del perfil en el DOM
    loadUserProfile() {
        const profileData = document.getElementById('profileData');
        if (!profileData) return;

        profileData.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Nombre:</label>
                    <p class="border-bottom pb-2">${this.currentUser.nombre || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Apellido:</label>
                    <p class="border-bottom pb-2">${this.currentUser.apellido || 'No especificado'}</p>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Email:</label>
                    <p class="border-bottom pb-2">${this.currentUser.email || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Teléfono:</label>
                    <p class="border-bottom pb-2">${this.currentUser.telefono || 'No especificado'}</p>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-12">
                    <label class="form-label fw-bold">Dirección:</label>
                    <p class="border-bottom pb-2">${this.currentUser.direccion || 'No especificado'}</p>
                </div>
            </div>
        `;
    }

    // Carga y muestra la lista de pedidos del usuario
    async loadUserOrders() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;

        ordersList.innerHTML = '<p>Cargando pedidos...</p>';

        try {
            const orders = await this.orderService.getUserOrders();

            if (!orders.length) {
                ordersList.innerHTML = '<p>No tienes pedidos realizados.</p>';
                return;
            }

            let html = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            orders.forEach(order => {
                html += `
                    <tr>
                        <td>${order.id}</td>
                        <td>${new Date(order.fecha).toLocaleDateString()}</td>
                        <td>${order.estado}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td><button class="btn btn-sm btn-primary" data-order-id="${order.id}">Ver</button></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            ordersList.innerHTML = html;

            // Agrega evento para mostrar detalles del pedido en modal
            ordersList.querySelectorAll('button[data-order-id]').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const orderId = e.target.getAttribute('data-order-id');
                    await this.showOrderDetails(orderId);
                });
            });

        } catch (error) {
            ordersList.innerHTML = '<p>Error al cargar los pedidos.</p>';
            console.error('Error cargando pedidos:', error);
        }
    }

    // Muestra detalles de un pedido en un modal Bootstrap
    async showOrderDetails(orderId) {
        try {
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                alert('No se pudo cargar el detalle del pedido.');
                return;
            }

            // Construye el contenido HTML para el modal con detalles del pedido
            const modalBody = document.getElementById('orderDetailsModalBody');
            if (!modalBody) return;

            // Ejemplo simple de detalles, ajusta según estructura real del pedido
            modalBody.innerHTML = `
                <p><strong>ID Pedido:</strong> ${order.id}</p>
                <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> ${order.estado}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Productos:</strong></p>
                <ul>
                    ${order.productos ? order.productos.map(p => `<li>${p.nombre} - Cantidad: ${p.cantidad}</li>`).join('') : '<li>No hay productos</li>'}
                </ul>
            `;

            // Muestra el modal usando Bootstrap 5
            const modalElement = document.getElementById('orderDetailsModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            alert('Error al obtener detalles del pedido.');
        }
    }

    // Configura eventos, como el botón de logout
    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.authService.logout();
            });
        }
    }
}
// Importa los servicios necesarios
import { OrderService } from '../services/customer/user_services.js';
import { UserService } from '../services/customer/orders_services.js'; 

document.addEventListener('DOMContentLoaded', function() {
    new ProfileManager();
});

class ProfileManager {
    constructor() {
        this.orderService = new OrderService();
        this.userService = new UserService(); // Inicializa el servicio de usuario
        this.currentUser = null; // Inicialmente no hay usuario
        this.init();
    }

    async init() {
        // Intenta cargar el perfil del usuario al inicializar
        await this.loadCurrentUser();

        if (!this.currentUser) {
            // Si no se puede cargar el usuario, redirige a la página de login
            window.location.href = '/pages/customer/Login.html';
            return;
        }

        // Carga la información del perfil y los pedidos
        this.loadUserProfile();
        this.loadUserOrders();
        this.setupEventListeners();
    }

    // Carga la información del usuario actual desde el backend
    async loadCurrentUser() {
        try {
            // se asume que tiene un endpoint para obtener el usuario actual
            this.currentUser = await this.userService.getCurrentUser();
        } catch (error) {
            console.error('Error al cargar el usuario actual:', error);
            this.currentUser = null; // Asegura que currentUser sea null en caso de error
        }
    }

    // Carga la información del perfil del usuario en la página
    loadUserProfile() {
        const profileData = document.getElementById('profileData');
        if (!profileData) return;

        // Construye el HTML con la información del usuario
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

    // Carga la lista de pedidos del usuario
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

    async showOrderDetails(orderId) {
        try {
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                alert('No se pudo cargar el detalle del pedido.');
                return;
            }

            alert(`Detalle del pedido ID ${orderId}:\n` + JSON.stringify(order, null, 2));

        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            alert('Error al obtener detalles del pedido.');
        }
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Elimina cualquier información de autenticación (ej. cookies, headers)
                this.userService.logout();
                window.location.href = '/index.html';
            });
        }
    }
}
// Importa los servicios necesarios
import { CustomerUserService } from '../services/customer/user_services.js';  // Servicio para usuario comprador
import { OrderService } from '../services/customer/orders_services.js'; // Servicio para pedidos
import { AuthService } from '../services/auth_services.js';
import { UIService } from '../services/ui-service.js'; // Servicio UI centralizado

export class ProfileManager {
    constructor() {
        // Instancia los servicios
        this.userService = new CustomerUserService();
        this.authService = new AuthService();
        this.orderService = new OrderService();
        this.uiService = new UIService();
        this.currentUser = null; // Usuario inicialmente no cargado
        this.init();
    }

    // Método para inicializar la carga de datos y eventos
    async init() {
        try {
            // Carga el perfil del usuario autenticado
            await this.loadCurrentUser();

            if (!this.currentUser) {
                // Si no hay usuario autenticado, redirige a login
                window.location.href = '/pages/customer/Login.html';
                return;
            }

            // Carga la información del perfil y los pedidos
            this.loadUserProfile();
            await this.loadUserOrders();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error al inicializar perfil:', error);
            this.uiService.showMessage('Error al cargar datos de perfil', 'danger');
        }
    }

    // Obtiene la información del usuario autenticado desde backend
    async loadCurrentUser() {
        try {
            this.currentUser = await this.userService.getCurrentUser();
        } catch (error) {
            console.error('Error al cargar el usuario actual:', error);
            this.currentUser = null;
            this.uiService.showMessage('Error al cargar datos de usuario', 'danger');
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

            if (!orders || !orders.length) {
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
                        <td>$${order.total.toLocaleString()}</td>
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
            this.uiService.showMessage('Error al cargar tus pedidos', 'danger');
        }
    }

    // Muestra detalles de un pedido en un modal Bootstrap
    async showOrderDetails(orderId) {
        try {
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                this.uiService.showMessage('No se pudo cargar el detalle del pedido', 'danger');
                return;
            }

            // Usar UIService para crear y mostrar el modal
            this.uiService.createModal({
                id: 'orderDetailsModal',
                title: `Detalles del Pedido #${order.id}`,
                size: 'modal-lg',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                            <p><strong>Estado:</strong> ${order.estado}</p>
                            <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Dirección de envío:</strong> ${order.direccionEnvio || 'No especificada'}</p>
                            <p><strong>Método de pago:</strong> ${order.metodoPago || 'No especificado'}</p>
                        </div>
                    </div>
                    <hr>
                    <h5>Productos:</h5>
                    <ul class="list-group">
                        ${order.productos ? order.productos.map(p => 
                            `<li class="list-group-item d-flex justify-content-between align-items-center">
                                ${p.nombre}
                                <span class="badge bg-primary rounded-pill">${p.cantidad}</span>
                            </li>`
                        ).join('') : '<li class="list-group-item">No hay productos</li>'}
                    </ul>
                `
            }).show();

        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            this.uiService.showMessage('Error al obtener detalles del pedido', 'danger');
        }
    }

    // Configura eventos, como el botón de logout
    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await this.authService.logout();
                    window.location.href = '/pages/customer/Login.html';
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    this.uiService.showMessage('Error al cerrar sesión', 'danger');
                }
            });
        }

        // Configurar botón de editar perfil si existe
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileForm();
            });
        }
    }

    // Muestra el formulario para editar el perfil
    showEditProfileForm() {
        this.uiService.createModal({
            id: 'editProfileModal',
            title: 'Editar Perfil',
            content: `
                <form id="editProfileForm">
                    <div class="mb-3">
                        <label for="editNombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="editNombre" value="${this.currentUser.nombre || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editApellido" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="editApellido" value="${this.currentUser.apellido || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editTelefono" class="form-label">Teléfono</label>
                        <input type="tel" class="form-control" id="editTelefono" value="${this.currentUser.telefono || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editDireccion" class="form-label">Dirección</label>
                        <textarea class="form-control" id="editDireccion">${this.currentUser.direccion || ''}</textarea>
                    </div>
                </form>
            `,
            buttons: [
                {
                    text: 'Guardar cambios',
                    class: 'btn-primary',
                    callback: () => this.saveProfileChanges()
                },
                {
                    text: 'Cancelar',
                    class: 'btn-secondary',
                    close: true
                }
            ]
        }).show();
    }

    // Guarda los cambios del perfil
    async saveProfileChanges() {
        try {
            const updatedData = {
                nombre: document.getElementById('editNombre').value,
                apellido: document.getElementById('editApellido').value,
                telefono: document.getElementById('editTelefono').value,
                direccion: document.getElementById('editDireccion').value,
            };

            await this.userService.updateProfile(updatedData);
            
            // Actualizar los datos del usuario actual
            await this.loadCurrentUser();
            
            // Actualizar la visualización del perfil
            this.loadUserProfile();
            
            this.uiService.showMessage('Perfil actualizado correctamente', 'success');
            
            // Cerrar el modal
            const modalElement = document.getElementById('editProfileModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
            
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            this.uiService.showMessage('Error al actualizar el perfil', 'danger');
        }
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
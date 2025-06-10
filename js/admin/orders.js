// Importación de servicios necesarios
import { OrderService } from '../services/admin/manage_orders_services.js'; // Corregida la extensión del archivo
import { UIService } from '../services/ui-service.js'; // Importado el servicio UI centralizado

export class OrdersManager {
    // Constructor que inicializa las instancias de servicios
    constructor() {
        this.orderService = new OrderService();
        this.uiService = new UIService(); // Instanciar el servicio UI centralizado
    }

    // Método para inicializar la carga de pedidos y configurar eventos
    async init() {
        await this.loadOrders();
        this.setupEventListeners();
        this.ensureModalExists(); // Asegurar que exista el modal de detalles
    }

    // Asegurar que exista el modal para detalles de pedidos
    ensureModalExists() {
        if (!document.getElementById('orderDetailsModal')) {
            this.uiService.createModal({
                id: 'orderDetailsModal',
                title: 'Detalles del Pedido',
                size: 'modal-lg',
                content: '<div id="orderDetailsContent"></div>'
            });
        }
    }

    // Método para cargar la lista de pedidos desde el backend
    async loadOrders() {
        try {
            const orders = await this.orderService.getAllOrders();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            this.showMessage('Error al cargar pedidos', 'danger');
        }
    }

    // Método para renderizar la tabla de pedidos en el DOM
    renderOrders(orders) {
        const tableBody = document.getElementById('tablaPedidos');
        if (!tableBody) {
            console.error('Elemento tbody con id "tablaPedidos" no encontrado');
            return;
        }

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay pedidos disponibles</td>
                </tr>
            `;
            return;
        }

        // Generar el HTML para cada fila de pedido y asignarlo al tbody
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.usuario?.nombre || 'N/A'}</td>
                <td>${new Date(order.fecha).toLocaleString()}</td>
                <td>$${order.total.toLocaleString()}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.estado)}">
                        ${order.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-id="${order.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-success complete-btn" data-id="${order.id}" title="Completar pedido">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger cancel-btn" data-id="${order.id}" title="Cancelar pedido">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Inicializar los botones de acción después de renderizar
        this.initButtonsEvents();
    }

    // Inicializar eventos para los botones de acción
    initButtonsEvents() {
        // Usando delegación de eventos en lugar de atributos onclick
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewOrder(btn.dataset.id));
        });

        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateStatus(btn.dataset.id, 'completado'));
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateStatus(btn.dataset.id, 'cancelado'));
        });
    }

    // Método para obtener la clase de color Bootstrap según el estado del pedido
    getStatusColor(status) {
        switch (status) {
            case 'pendiente': return 'warning';
            case 'completado': return 'success';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    }

    // Método para actualizar el estado de un pedido
    async updateStatus(orderId, newStatus) {
        try {
            await this.orderService.updateOrderStatus(orderId, newStatus);
            await this.loadOrders();
            this.showMessage('Estado actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            this.showMessage('Error al actualizar estado', 'danger');
        }
    }

    // Método para mostrar mensajes de alerta usando UIService
    showMessage(message, type) {
        this.uiService.showMessage(message, type);
    }

    // Método para configurar eventos globales si es necesario
    setupEventListeners() {
        // Si hay eventos adicionales de nivel de página, se configurarían aquí
    }

    // Método para mostrar los detalles de un pedido en un modal
    async viewOrder(orderId) {
        try {
            // obtener los detalles completos del pedido desde el backend usando el orderId y el servicio OrderService
            const order = await this.orderService.getOrderById(orderId);

            if (!order) {
                this.showMessage('No se pudo encontrar el pedido', 'danger');
                return;
            }

            // Generar el HTML con los detalles del pedido
            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Cliente:</strong> ${order.usuario?.nombre || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.usuario?.email || 'N/A'}</p>
                        <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Estado:</strong> 
                            <span class="badge bg-${this.getStatusColor(order.estado)}">${order.estado}</span>
                        </p>
                        <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
                        <p><strong>Método de Pago:</strong> ${order.metodoPago || 'No especificado'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>Dirección de Envío:</h5>
                        <p>${order.direccionEnvio || 'No especificada'}</p>
                    </div>
                </div>
                <hr>
                <h5>Productos:</h5>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.productos?.map(producto => `
                                <tr>
                                    <td>${producto.nombre}</td>
                                    <td>$${producto.precio.toLocaleString()}</td>
                                    <td>${producto.cantidad}</td>
                                    <td>$${(producto.precio * producto.cantidad).toLocaleString()}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4">No hay productos</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;

            // Mostrar el modal usando UIService
            const modalContent2 = document.getElementById('orderDetailsContent');
            if (modalContent2) {
                modalContent2.innerHTML = modalContent;
            }
            
            this.uiService.showModal('orderDetailsModal');

        } catch (error) {
            console.error('Error al cargar detalles del pedido:', error);
            this.showMessage('Error al cargar detalles del pedido', 'danger');
        }
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no es controlado por AdminManager
    if (!window.adminManager) {
        window.ordersManager = new OrdersManager();
        window.ordersManager.init().catch(console.error);
    }
});
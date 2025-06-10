// Importación del servicio para manejo de pedidos desde el archivo correspondiente
import { OrderService } from '../services/admin/manage_orders_services';

export class OrdersManager {
    // Constructor que inicializa la instancia del servicio
    constructor() {
        this.orderService = new OrderService();
    }

    // Método para inicializar la carga de pedidos y configurar eventos
    async init() {
        await this.loadOrders();
        this.setupEventListeners();
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

        // Generar el HTML para cada fila de pedido y asignarlo al tbody
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.usuario?.name || 'N/A'}</td>
                <td>${new Date(order.fecha).toLocaleString()}</td>
                <td>$${order.total.toLocaleString()}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.estado)}">
                        ${order.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="window.ordersManager.viewOrder('${order.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-success" onclick="window.ordersManager.updateStatus('${order.id}', 'completado')" title="Completar pedido">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.ordersManager.updateStatus('${order.id}', 'cancelado')" title="Cancelar pedido">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

    // Método para mostrar mensajes de alerta en la interfaz
    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;
        const container = document.querySelector('.content');
        if (container) {
            container.prepend(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Método para configurar eventos globales si es necesario
    setupEventListeners() {
        
    }

    // Método para mostrar los detalles de un pedido en un modal
    async viewOrder(orderId) {
        try {
            // Aquí debes obtener los detalles completos del pedido desde el backend
            // usando el orderId y el servicio OrderService
            const order = await this.orderService.getOrderById(orderId);

            if (!order) {
                this.showMessage('No se pudo encontrar el pedido', 'danger');
                return;
            }

            // Generar el HTML con los detalles del pedido
            const modalContent = `
                <h4>Detalles del Pedido ${order.id}</h4>
                <p><strong>Cliente:</strong> ${order.usuario?.name || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
                <p><strong>Estado:</strong> ${order.estado}</p>
                <hr>
                <h5>Productos:</h5>
                <ul>
                    ${order.productos?.map(producto => `<li>${producto.nombre} - $${producto.precio}</li>`).join('') || '<li>No hay productos</li>'}
                </ul>
                <p><strong>Dirección de Envío:</strong> ${order.direccionEnvio || 'No especificada'}</p>
                <p><strong>Método de Pago:</strong> ${order.metodoPago || 'No especificado'}</p>
                <!-- Agrega aquí más detalles del pedido según tu modelo de datos -->
            `;

            // Insertar el contenido en el modal y mostrarlo
            document.getElementById('orderDetailsModalBody').innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
            modal.show();

        } catch (error) {
            console.error('Error al cargar detalles del pedido:', error);
            this.showMessage('Error al cargar detalles del pedido', 'danger');
        }
    }
}

// Inicializar y exponer globalmente para uso en HTML inline
window.ordersManager = new OrdersManager();
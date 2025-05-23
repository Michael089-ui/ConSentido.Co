import { OrderService } from '../services/orders_services.js';

export class OrdersManager {
    constructor() {
        this.orderService = new OrderService();
    }

    async init() {
        await this.loadOrders();
        this.setupEventListeners();
    }

    async loadOrders() {
        try {
            const orders = await this.orderService.getAllOrders();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showMessage('Error al cargar pedidos', 'danger');
        }
    }

    renderOrders(orders) {
        const tableBody = document.getElementById('tablaPedidos');
        if (!tableBody) return;

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.usuario.name}</td>
                <td>${new Date(order.fecha).toLocaleString()}</td>
                <td>$${order.total.toLocaleString()}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.estado)}">
                        ${order.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="ordersManager.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="ordersManager.updateStatus('${order.id}', 'completado')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ordersManager.updateStatus('${order.id}', 'cancelado')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        switch (status) {
            case 'pendiente': return 'warning';
            case 'completado': return 'success';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    }

    async updateStatus(orderId, newStatus) {
        try {
            await this.orderService.updateOrderStatus(orderId, newStatus);
            await this.loadOrders();
            this.showMessage('Estado actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al actualizar estado', 'danger');
        }
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.content').prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Inicializar y exponer globalmente
window.ordersManager = new OrdersManager();
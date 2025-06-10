import { OrderService } from '../services/admin/manage_orders_services.js';
import { UIService } from '../services/ui-service.js';

export class OrdersManager {
    constructor() {
        this.orderService = new OrderService();
        this.uiService = new UIService();
        this.orders = [];
    }

    async init() {
        await this.loadOrders();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const filterSelect = document.getElementById('filterStatus');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterOrders());
        }
        
        const searchInput = document.getElementById('searchOrder');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterOrders());
        }
    }

    async loadOrders() {
        try {
            const spinner = document.createElement('div');
            spinner.className = 'text-center my-4';
            spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
            
            const container = document.querySelector('.content');
            if (container) container.prepend(spinner);
            
            this.orders = await this.orderService.getAllOrders();
            this.renderOrders(this.orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showMessage('Error al cargar pedidos', 'danger');
        } finally {
            const spinner = document.querySelector('.spinner-border')?.parentNode;
            if (spinner) spinner.remove();
        }
    }

    renderOrders(orders) {
        const tableBody = document.getElementById('tablaPedidos');
        if (!tableBody) return;

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-3">No hay pedidos disponibles</td></tr>`;
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.usuario?.name || 'Usuario no disponible'}</td>
                <td>${new Date(order.fecha).toLocaleString()}</td>
                <td>$${(order.total || 0).toLocaleString()}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.estado)}">
                        ${order.estado || 'desconocido'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info view-order" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success complete-order" data-id="${order.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger cancel-order" data-id="${order.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to buttons
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', () => this.viewOrder(btn.dataset.id));
        });
        
        document.querySelectorAll('.complete-order').forEach(btn => {
            btn.addEventListener('click', () => this.confirmStatusChange(btn.dataset.id, 'completado'));
        });
        
        document.querySelectorAll('.cancel-order').forEach(btn => {
            btn.addEventListener('click', () => this.confirmStatusChange(btn.dataset.id, 'cancelado'));
        });
    }

    filterOrders() {
        const filterValue = document.getElementById('filterStatus')?.value;
        const searchText = document.getElementById('searchOrder')?.value?.toLowerCase();
        
        let filteredOrders = [...this.orders];
        
        if (filterValue && filterValue !== 'todos') {
            filteredOrders = filteredOrders.filter(order => order.estado === filterValue);
        }
        
        if (searchText) {
            filteredOrders = filteredOrders.filter(order => 
                order.id.toString().includes(searchText) || 
                order.usuario?.name?.toLowerCase().includes(searchText)
            );
        }
        
        this.renderOrders(filteredOrders);
    }

    getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'pendiente': return 'warning';
            case 'completado': return 'success';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    }

    async confirmStatusChange(orderId, newStatus) {
        const confirmMessage = newStatus === 'completado' 
            ? '¿Confirmar que este pedido se ha completado?'
            : '¿Está seguro de cancelar este pedido?';
            
        if (confirm(confirmMessage)) {
            await this.updateStatus(orderId, newStatus);
        }
    }

    async updateStatus(orderId, newStatus) {
        try {
            await this.orderService.updateOrderStatus(orderId, newStatus);
            await this.loadOrders();
            this.showMessage(`Pedido ${orderId} ${newStatus === 'completado' ? 'completado' : 'cancelado'} correctamente`, 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al actualizar estado del pedido', 'danger');
        }
    }

    async viewOrder(orderId) {
        try {
            const order = await this.orderService.getOrderById(orderId);
            if (!order) throw new Error('Pedido no encontrado');
            
            const modalContent = this.createOrderDetailsHTML(order);
            
            // Use UIService or create a modal manually
            const modalOptions = {
                title: `Detalles del Pedido #${orderId}`,
                content: modalContent,
                size: 'lg'
            };
            
            if (this.uiService) {
                this.uiService.createModal(modalOptions).show();
            } else {
                // Fallback for manual modal display
                const modalElement = document.getElementById('orderDetailsModal');
                if (modalElement) {
                    const bodyElement = modalElement.querySelector('.modal-body');
                    if (bodyElement) bodyElement.innerHTML = modalContent;
                    const titleElement = modalElement.querySelector('.modal-title');
                    if (titleElement) titleElement.textContent = `Detalles del Pedido #${orderId}`;
                    
                    const bsModal = new bootstrap.Modal(modalElement);
                    bsModal.show();
                }
            }
        } catch (error) {
            console.error('Error viewing order details:', error);
            this.showMessage('Error al cargar detalles del pedido', 'danger');
        }
    }

    createOrderDetailsHTML(order) {
        return `
            <div class="order-details">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Información del Cliente</h5>
                        <p><strong>Cliente:</strong> ${order.usuario?.name || 'No disponible'}</p>
                        <p><strong>Email:</strong> ${order.usuario?.email || 'No disponible'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Información del Pedido</h5>
                        <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleString()}</p>
                        <p><strong>Estado:</strong> <span class="badge bg-${this.getStatusColor(order.estado)}">${order.estado}</span></p>
                        <p><strong>Total:</strong> $${(order.total || 0).toLocaleString()}</p>
                    </div>
                </div>
                
                <h5>Productos</h5>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderOrderItems(order.items || [])}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderOrderItems(items) {
        if (!items || items.length === 0) {
            return '<tr><td colspan="4" class="text-center">No hay productos en este pedido</td></tr>';
        }
        
        return items.map(item => `
            <tr>
                <td>${item.producto?.nombre || 'Producto no disponible'}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precioUnitario || 0).toLocaleString()}</td>
                <td>$${((item.precioUnitario || 0) * (item.cantidad || 0)).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    showMessage(message, type) {
        if (this.uiService) {
            this.uiService.showMessage(message, type);
            return;
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.querySelector('.content');
        if (container) container.prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Initialize instance
const ordersManager = new OrdersManager();
// Export for module use
export { ordersManager };
// Expose globally for HTML onclick attributes
window.ordersManager = ordersManager;
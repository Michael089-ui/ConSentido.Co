import { HttpService } from "../http-service.js";
import { AuthService } from "../auth-service.js";

/**
 * Servicio para gestionar operaciones relacionadas con órdenes/pedidos (panel cliente)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class OrderService {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.authService = new AuthService();
        this.endpoint = '/pedidos';
    }

    /**
     * Obtiene las órdenes del usuario autenticado
     * @returns {Promise<Array>} Lista de pedidos o array vacío
     */
    async getUserOrders() {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot suele usar un endpoint específico para los pedidos del usuario autenticado
            const response = await this.httpService.get(`${this.endpoint}/mis-pedidos`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error al obtener pedidos del usuario:', error);
            return [];
        }
    }

    /**
     * Obtiene detalles de una orden específica del usuario
     * @param {string} id - ID del pedido a consultar
     * @returns {Promise<Object|null>} Datos del pedido o null si no existe
     */
    async getOrderById(id) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot verificará que el pedido pertenezca al usuario autenticado
            return await this.httpService.get(`${this.endpoint}/mis-pedidos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error(`Error al obtener pedido con ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Crea una nueva orden para el usuario autenticado
     * @param {Object} orderData - Datos de la orden a crear
     * @returns {Promise<Object>} Datos de la orden creada
     */
    async createOrder(orderData) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot asociará automáticamente el pedido al usuario autenticado
            const response = await this.httpService.post(this.endpoint, orderData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Actualiza el estado de una orden propia del usuario
     * @param {string} id - ID de la orden a actualizar
     * @param {string} status - Nuevo estado para la orden
     * @returns {Promise<Object>} Datos actualizados de la orden
     */
    async updateOrderStatus(id, status) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot verificará que el pedido pertenezca al usuario autenticado
            return await this.httpService.patch(`${this.endpoint}/mis-pedidos/${id}`, {
                estado: status
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }
    
    /**
     * Cancela un pedido del usuario
     * @param {string} id - ID del pedido a cancelar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async cancelOrder(id) {
        try {
            return await this.updateOrderStatus(id, 'CANCELADO');
        } catch (error) {
            console.error('Error al cancelar pedido:', error);
            throw error;
        }
    }
    
    /**
     * Verifica si un usuario tiene permiso para gestionar un pedido específico
     * @param {Object} order - Datos del pedido a verificar
     * @returns {Promise<boolean>} - true si tiene permiso, false en caso contrario
     */
    async canManageOrder(order) {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) return false;
            
            // Si no hay pedido, o no tiene información de usuario, no permitir la gestión
            if (!order || !order.usuario || !order.usuario.email) return false;
            
            // El usuario solo puede gestionar sus propios pedidos
            return currentUser.email === order.usuario.email;
        } catch (error) {
            console.error('Error al verificar permisos sobre pedido:', error);
            return false;
        }
    }
}
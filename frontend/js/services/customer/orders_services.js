import { HttpService } from "../http-service.js";

/**
 * Servicio para gestionar operaciones relacionadas con órdenes (panel cliente)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class OrderService {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/pedidos';
    }

    /**
     * Obtiene las órdenes del usuario autenticado
     * @returns {Promise<Array>} Lista de pedidos o array vacío
     */
    async getUserOrders() {
        try {
            return await this.httpService.get(`${this.endpoint}/mis-pedidos`);
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
            return await this.httpService.get(`${this.endpoint}/mis-pedidos/${id}`);
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
            return await this.httpService.post(this.endpoint, orderData);
        } catch (error) {
            console.error('Error en createOrder:', error);
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
            return await this.httpService.patch(`${this.endpoint}/mis-pedidos/${id}`, {
                estado: status
            });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }
}
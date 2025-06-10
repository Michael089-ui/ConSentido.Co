// Importamos el servicio HTTP centralizado en lugar de usar fetch directamente
import { HttpService } from "../http-service.js";

/**
 * Clase para gestionar operaciones relacionadas con órdenes (panel administrador)
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
     * Obtiene todos los pedidos disponibles
     * @returns {Promise<Array>} Lista de pedidos o array vacío
     */
    async getAllOrders() {
        try {
            return await this.httpService.get(this.endpoint);
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            return [];
        }
    }

    /**
     * Obtiene un pedido específico por su ID
     * @param {string} orderId - ID del pedido a consultar
     * @returns {Promise<Object|null>} Datos del pedido o null si no existe
     */
    async getOrderById(orderId) {
        try {
            return await this.httpService.get(`${this.endpoint}/${orderId}`);
        } catch (error) {
            console.error(`Error al obtener pedido ${orderId}:`, error);
            return null;
        }
    }

    /**
     * Crea una nueva orden en el sistema
     * @param {Object} orderData - Datos de la orden a crear
     * @returns {Promise<Object>} Datos de la orden creada
     */
    async createOrder(orderData) {
        try {
            return await this.httpService.post(this.endpoint, orderData);
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Actualiza el estado de una orden existente
     * @param {string} id - ID de la orden a actualizar
     * @param {string} status - Nuevo estado para la orden
     * @returns {Promise<Object>} Datos actualizados de la orden
     */
    async updateOrderStatus(id, status) {
        try {
            return await this.httpService.patch(`${this.endpoint}/${id}`, { 
                estado: status 
            });
        } catch (error) {
            console.error(`Error al actualizar estado del pedido ${id}:`, error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }
}
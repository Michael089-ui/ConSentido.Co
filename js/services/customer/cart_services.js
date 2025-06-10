// Este archivo se encarga de manejar el carrito de compras del cliente, comunicándose con el backend

import { HttpService } from "../http-service.js";

/**
 * Servicio para gestionar operaciones del carrito de compras del cliente
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class CustomerCartService {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/carrito';
    }

    /**
     * Obtiene el contenido actual del carrito
     * @returns {Promise<Array>} - Lista de productos en el carrito o array vacío
     */
    async getCart() {
        try {
            return await this.httpService.get(this.endpoint);
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return []; // Retornar array vacío como fallback
        }
    }

    /**
     * Agrega un producto al carrito
     * @param {Object} producto - Objeto con producto_id y cantidad
     * @returns {Promise<Object>} - Carrito actualizado
     */
    async addToCart(producto) {
        try {
            return await this.httpService.post(this.endpoint, producto);
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            throw error; // Propagamos el error para que la UI pueda manejarlo
        }
    }

    /**
     * Elimina un producto del carrito
     * @param {string} productId - ID del producto a eliminar
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async removeFromCart(productId) {
        try {
            return await this.httpService.delete(`${this.endpoint}/${productId}`);
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            throw error; // Propagamos el error para manejo en la UI
        }
    }

    /**
     * Vacía completamente el carrito
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async clearCart() {
        try {
            return await this.httpService.delete(this.endpoint);
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            throw error; // Propagamos el error para manejo en la UI
        }
    }

    /**
     * Actualiza la cantidad de un producto en el carrito
     * @param {string} productId - ID del producto a actualizar
     * @param {number} quantity - Nueva cantidad
     * @returns {Promise<Object>} - Carrito actualizado
     */
    async updateQuantity(productId, quantity) {
        try {
            return await this.httpService.put(`${this.endpoint}/${productId}`, {
                cantidad: quantity
            });
        } catch (error) {
            console.error('Error al actualizar cantidad en el carrito:', error);
            throw error;
        }
    }
}
import { HttpService } from "../http-service.js";
import { AuthService } from "../auth-service.js";

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
        this.authService = new AuthService();
        this.endpoint = '/api/carrito';  // Ruta para API Spring Boot
    }

    /**
     * Obtiene el contenido actual del carrito del usuario autenticado
     * @returns {Promise<Array>} - Lista de productos en el carrito o array vacío
     */
    async getCart() {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Configuración con token de autenticación
            const options = {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            };
            
            // Spring Boot asociará el carrito con el usuario autenticado
            const response = await this.httpService.get(this.endpoint, options);
            
            // La API Spring Boot debe devolver un objeto con la propiedad "productos" o similar
            return response.productos || response.items || [];
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return []; // Retornar array vacío como fallback
        }
    }

    /**
     * Agrega un producto al carrito
     * @param {Object} item - Objeto con producto_id y cantidad
     * @returns {Promise<Object>} - Carrito actualizado
     */
    async addToCart(item) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot espera un formato específico para añadir al carrito
            const cartItem = {
                productoId: item.producto_id,
                cantidad: item.cantidad || 1
            };
            
            // Añadir al carrito en Spring Boot
            const response = await this.httpService.post(this.endpoint, cartItem, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto del carrito
     * @param {string|number} productId - ID del producto a eliminar
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async removeFromCart(productId) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot generalmente espera el ID como parte de la URL
            const response = await this.httpService.delete(`${this.endpoint}/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            throw error;
        }
    }

    /**
     * Vacía completamente el carrito
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async clearCart() {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot generalmente tiene un endpoint específico para vaciar el carrito
            const response = await this.httpService.delete(`${this.endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            throw error;
        }
    }

    /**
     * Actualiza la cantidad de un producto en el carrito
     * @param {string|number} productId - ID del producto a actualizar
     * @param {number} quantity - Nueva cantidad
     * @returns {Promise<Object>} - Carrito actualizado
     */
    async updateQuantity(productId, quantity) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot espera un formato específico para actualizar cantidad
            const cartItem = {
                productoId: productId,
                cantidad: quantity
            };
            
            // En Spring Boot generalmente se usa PATCH o PUT para actualizar
            const response = await this.httpService.put(`${this.endpoint}/${productId}`, cartItem, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error al actualizar cantidad en el carrito:', error);
            throw error;
        }
    }
    
    /**
     * Verifica si el usuario puede realizar operaciones con el carrito
     * @returns {Promise<boolean>} - true si el usuario está autenticado
     */
    async canManageCart() {
        const isAuthenticated = await this.authService.isAuthenticated();
        if (!isAuthenticated) {
            console.warn('Usuario no autenticado. Se requiere iniciar sesión para gestionar el carrito.');
            return false;
        }
        return true;
    }
}
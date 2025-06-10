// Importamos el servicio HTTP centralizado en lugar de usar fetch directamente
import { HttpService } from "../http-service.js";

/**
 * Clase para gestionar operaciones relacionadas con productos (panel administrador)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class ProductServices {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/productos';
    }

    /**
     * Obtiene todos los productos disponibles
     * @returns {Promise<Array>} Lista de productos o array vacío
     */
    async getAllProducts() {
        try {
            return await this.httpService.get(this.endpoint);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    }

    /**
     * Obtiene un producto específico por su ID
     * @param {string} id - ID del producto a consultar
     * @returns {Promise<Object|null>} Datos del producto o null si no existe
     */
    async getProductById(id) {
        try {
            return await this.httpService.get(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error(`Error al obtener producto con ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Crea un nuevo producto en el sistema
     * @param {Object} productData - Datos del producto a crear
     * @returns {Promise<Object>} Datos del producto creado
     */
    async createProduct(productData) {
        try {
            return await this.httpService.post(this.endpoint, productData);
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Actualiza un producto existente
     * @param {string} id - ID del producto a actualizar
     * @param {Object} newData - Nuevos datos del producto
     * @returns {Promise<Object>} Datos actualizados del producto
     */
    async updateProduct(id, newData) {
        try {
            return await this.httpService.put(`${this.endpoint}/${id}`, newData);
        } catch (error) {
            console.error(`Error al actualizar producto con ID ${id}:`, error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Elimina un producto del sistema
     * @param {string} id - ID del producto a eliminar
     * @returns {Promise<boolean>} true si se eliminó correctamente
     */
    async deleteProduct(id) {
        try {
            await this.httpService.delete(`${this.endpoint}/${id}`);
            return true;
        } catch (error) {
            console.error(`Error al eliminar producto con ID ${id}:`, error);
            return false;
        }
    }
}
import { HttpService } from './http-service.js';

/**
 * Servicio para gestionar operaciones con datos desde el backend
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class DataService {
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/productos';
    }

    /**
     * Obtiene todos los productos del backend
     * @returns {Promise<Array>} Lista de productos
     */
    async getAllProducts() {
        try {
            return await this.httpService.get(this.endpoint);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            return [];
        }
    }

    /**
     * Agrega un nuevo producto
     * @param {Object} product - Datos del producto a agregar
     * @returns {Promise<Object>} Producto creado
     */
    async addProduct(product) {
        try {
            return await this.httpService.post(this.endpoint, product);
        } catch (error) {
            console.error('Error al agregar producto:', error);
            throw error;
        }
    }

    /**
     * Actualiza un producto existente
     * @param {string|number} id - ID del producto a actualizar
     * @param {Object} updatedProduct - Datos actualizados del producto
     * @returns {Promise<Object>} Producto actualizado
     */
    async updateProduct(id, updatedProduct) {
        try {
            return await this.httpService.put(`${this.endpoint}/${id}`, updatedProduct);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto existente
     * @param {string|number} id - ID del producto a eliminar
     */
    async deleteProduct(id) {
        try {
            return await this.httpService.delete(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    }

    /**
     * Obtiene productos filtrados por categoría
     * @param {string|number} categoryId - ID de la categoría
     * @returns {Promise<Array>} Lista de productos de la categoría
     */
    async getProductsByCategory(categoryId) {
        try {
            // Consulta al endpoint de productos con filtro por categoría
            // El backend debe soportar esta consulta con parámetros
            return await this.httpService.get(`${this.endpoint}?categoria=${categoryId}`);
        } catch (error) {
            console.error('Error al filtrar productos por categoría:', error);
            return [];
        }
    }
    
    /**
     * Obtiene un producto por su ID
     * @param {string|number} id - ID del producto
     * @returns {Promise<Object|null>} Producto o null si no existe
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
     * Busca productos que coincidan con un término de búsqueda
     * @param {string} query - Término de búsqueda
     * @returns {Promise<Array>} Lista de productos que coinciden
     */
    async searchProducts(query) {
        try {
            // El backend debe soportar búsqueda con parámetro "q" o similar
            return await this.httpService.get(`${this.endpoint}/search?query=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }
}
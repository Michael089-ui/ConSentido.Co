import { HttpService } from "../http-service.js";

/**
 * Clase para gestionar operaciones relacionadas con productos (lado cliente)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class ProductService {
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
            return []; // Retornar array vacío como fallback
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
     * Obtiene productos por categoría
     * @param {string} categoria - Nombre de la categoría
     * @returns {Promise<Array>} Lista de productos de la categoría o array vacío
     */
    async getProductsByCategory(categoria) {
        try {
            return await this.httpService.get(`${this.endpoint}/categoria/${encodeURIComponent(categoria)}`);
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            return [];
        }
    }

    /**
     * Busca productos por palabra clave
     * @param {string} keyword - Término de búsqueda
     * @returns {Promise<Array>} Lista de productos encontrados o array vacío
     */
    async searchProductsByKeyword(keyword) {
        try {
            return await this.httpService.get(`${this.endpoint}/buscar?q=${encodeURIComponent(keyword)}`);
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }
    
    /**
     * Obtiene productos destacados o recomendados
     * @param {number} limit - Número máximo de productos a retornar
     * @returns {Promise<Array>} Lista de productos destacados o array vacío
     */
    async getFeaturedProducts(limit = 8) {
        try {
            return await this.httpService.get(`${this.endpoint}/destacados?limit=${limit}`);
        } catch (error) {
            console.error('Error al obtener productos destacados:', error);
            return [];
        }
    }
}
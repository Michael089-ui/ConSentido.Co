import { HttpService } from "../http-service.js";

/**
 * Servicio para gestionar operaciones relacionadas con productos (panel cliente)
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
            const products = await this.httpService.get(this.endpoint);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    }

    /**
     * Obtiene un producto específico por su ID
     * @param {string|number} id - ID del producto a consultar
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
     * @param {string|number} categoriaId - ID de la categoría
     * @returns {Promise<Array>} Lista de productos de la categoría o array vacío
     */
    async getProductsByCategory(categoriaId) {
        try {
            // Spring Boot espera filtros en formato específico, aquí usamos parámetro de consulta
            const products = await this.httpService.get(`${this.endpoint}/categoria/${categoriaId}`);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error(`Error al obtener productos de categoría ${categoriaId}:`, error);
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
            // Spring Boot suele usar /search o /buscar para endpoints de búsqueda
            const products = await this.httpService.get(`${this.endpoint}/buscar?q=${encodeURIComponent(keyword)}`);
            return Array.isArray(products) ? products : [];
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
            // Spring Boot suele tener endpoints específicos para destacados
            const products = await this.httpService.get(`${this.endpoint}/destacados?limit=${limit}`);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error al obtener productos destacados:', error);
            // Si falla, intentar con endpoint alternativo o retornar los más recientes
            try {
                const allProducts = await this.getAllProducts();
                // Ordenar por fecha o ID (asumiendo que IDs más altos son más recientes)
                return allProducts
                    .sort((a, b) => b.idProducto - a.idProducto)
                    .slice(0, limit);
            } catch (fallbackError) {
                console.error('Error en fallback de productos destacados:', fallbackError);
                return [];
            }
        }
    }

    /**
     * Obtiene productos por lista de IDs (útil para carrito/checkout)
     * @param {Array} idsList - Lista de IDs de productos
     * @returns {Promise<Array>} Lista de productos o array vacío
     */
    async getProductsByIds(idsList) {
        try {
            if (!Array.isArray(idsList) || idsList.length === 0) {
                return [];
            }
            
            // Si el backend no soporta consulta por múltiples IDs, hacer peticiones individuales
            if (idsList.length <= 3) {
                // Para pocos IDs, hacer peticiones individuales
                const productPromises = idsList.map(id => this.getProductById(id));
                const products = await Promise.all(productPromises);
                // Filtrar posibles nulls de productos no encontrados
                return products.filter(product => product !== null);
            } else {
                // Convertir array de IDs a string separada por comas para petición batch
                const idsParam = idsList.join(',');
                const products = await this.httpService.get(`${this.endpoint}/batch?ids=${idsParam}`);
                return Array.isArray(products) ? products : [];
            }
        } catch (error) {
            console.error('Error al obtener productos por IDs:', error);
            return [];
        }
    }
    
    /**
     * Obtiene las categorías disponibles
     * @returns {Promise<Array>} Lista de categorías o array vacío
     */
    async getCategories() {
        try {
            const categories = await this.httpService.get('/categorias');
            return Array.isArray(categories) ? categories : [];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    }
}
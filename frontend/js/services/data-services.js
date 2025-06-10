import { HttpService } from './http-service.js';

/**
 * Servicio para gestionar operaciones con datos desde el backend
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class DataService {
    /**
     * Constructor que inicializa los servicios necesarios y el endpoint base
     */
    constructor() {
        this.httpService = new HttpService();
        // No es necesario incluir la barra inicial ya que HttpService la maneja
        this.endpoint = 'productos';
    }

    /**
     * Obtiene todos los productos del backend
     * @returns {Promise<Array>} Lista de productos
     */
    async getAllProducts() {
        try {
            const products = await this.httpService.get(this.endpoint);
            return Array.isArray(products) ? products : [];
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
            // Validar que el producto tenga los campos requeridos
            if (!product.nombre || !product.precio) {
                throw new Error('El producto debe tener nombre y precio');
            }
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
            if (!id) {
                throw new Error('Se requiere ID del producto para actualizar');
            }
            return await this.httpService.put(`${this.endpoint}/${id}`, updatedProduct);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto existente
     * @param {string|number} id - ID del producto a eliminar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async deleteProduct(id) {
        try {
            if (!id) {
                throw new Error('Se requiere ID del producto para eliminar');
            }
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
            // Adaptar para usar formato correcto en Spring Boot
            const products = await this.httpService.get(`${this.endpoint}/categoria/${categoryId}`);
            return Array.isArray(products) ? products : [];
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
            if (!id) {
                throw new Error('Se requiere ID del producto');
            }
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
            if (!query || query.trim() === '') {
                return this.getAllProducts();
            }
            
            // Usar formato correcto para Spring Boot
            const products = await this.httpService.get(`${this.endpoint}/buscar?q=${encodeURIComponent(query)}`);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }
    
    /**
     * Obtiene productos destacados
     * @returns {Promise<Array>} Lista de productos destacados
     */
    async getFeaturedProducts() {
        try {
            const products = await this.httpService.get(`${this.endpoint}/destacados`);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error al obtener productos destacados:', error);
            return [];
        }
    }
    
    /**
     * Obtiene las categorías disponibles
     * @returns {Promise<Array>} Lista de categorías
     */
    async getCategories() {
        try {
            const categories = await this.httpService.get('categorias');
            return Array.isArray(categories) ? categories : [];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    }
}

// Exportar una instancia default para uso global
export default new DataService();
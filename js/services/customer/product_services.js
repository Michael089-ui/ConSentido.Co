// Importamos la URL base de la API desde el archivo de configuración
import { BASE_API_URL } from "../config.js";

// Creamos una clase para manejar productos desde el lado del cliente (customer)
export class ProductService {

    // Constructor que se ejecuta cuando se crea una instancia de esta clase
    constructor() {
        // Guardamos la URL base como propiedad de la clase para usarla en cada método
        this.apiUrl = BASE_API_URL;
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // MÉTODOS DISPONIBLES PARA EL CLIENTE - SOLO CONSULTAS (no editar ni crear)

    // Método para obtener la lista de todos los productos disponibles
    async getAllProducts() {
        try {
            // Realizamos la petición GET al endpoint de productos
            const response = await fetch(`${this.apiUrl}/productos`);

            // Verificamos si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('No se pudieron obtener los productos');
            }

            // Convertimos la respuesta en formato JSON y la retornamos
            return await response.json();
        } catch (error) {
            // Si hubo algún error (por red o servidor), lo mostramos en consola
            console.error('Error al obtener productos:', error);
            return []; // Retornamos un array vacío como fallback
        }
    }

    // Método para obtener los detalles de un solo producto según su ID
    async getProductById(id) {
        try {
            // Realizamos la petición GET al endpoint específico del producto
            const response = await fetch(`${this.apiUrl}/productos/${id}`);

            // Verificamos si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error(`No se pudo obtener el producto con ID ${id}`);
            }

            // Convertimos la respuesta en JSON y la retornamos
            return await response.json();
        } catch (error) {
            // Mostramos el error en consola y retornamos null si falla
            console.error(`Error al obtener producto con ID ${id}:`, error);
            return null;
        }
    }

    // Obtener productos por categoría
    async getProductsByCategory(categoria) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/categoria/${encodeURIComponent(categoria)}`);
            if (!response.ok) throw new Error('No se pudieron obtener los productos por categoría');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            return [];
        }
    }

    // Buscar productos por palabra clave (nombre, descripción, categoría)
    async searchProductsByKeyword(keyword) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/buscar?q=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error('No se pudieron obtener los productos para la búsqueda');
            }
            return await response.json();
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }
}

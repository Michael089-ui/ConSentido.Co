// Importación de la URL base de la API desde configuración
import { BASE_API_URL } from "../config.js";

// Clase para manejar operaciones relacionadas con productos (lado administrador)
export class ProductServices {
    // Constructor que inicializa la URL base del backend
    constructor() {
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos CRUD para interactuar con la API del backend

    // Método para obtener todos los productos
    async getAllProducts() {
        try {
            const response = await fetch(`${this.apiUrl}/productos`, {
                credentials: 'include' // Enviar cookies o token automáticamente si aplica
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los productos');
            }

            // Retorna la lista de productos en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y retorno de lista vacía en caso de fallo
            console.error('Error al obtener productos:', error);
            return [];
        }
    }

    // Método para obtener un producto por su ID
    async getProductById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`No se pudo obtener el producto con ID ${id}`);
            }

            // Retorna el producto encontrado en formato JSON
            return await response.json();

        } catch (error) {
            console.error(`Error al obtener producto con ID ${id}:`, error);
            return null;
        }
    }

    // Método para crear un nuevo producto
    async createProduct(productData) {
        try {
            const response = await fetch(`${this.apiUrl}/productos`, {
                method: 'POST', // Método HTTP POST para crear recurso
                headers: {
                    'Content-Type': 'application/json' // Indica que se envía JSON
                },
                credentials: 'include',
                body: JSON.stringify(productData) // Convierte el objeto a JSON
            });

            if (!response.ok) {
                throw new Error('No se pudo crear el producto');
            }

            // Retorna el producto creado en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores de red o servidor
            console.error('Error al crear producto:', error);
            throw error;
        }
    }

    // Método para actualizar un producto existente
    async updateProduct(id, newData) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'PUT', // Método HTTP PUT para actualizar recurso
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newData)
            });

            if (!response.ok) {
                throw new Error(`No se pudo actualizar el producto con ID ${id}`);
            }

            // Retorna el producto actualizado en formato JSON
            return await response.json();

        } catch (error) {
            console.error(`Error al actualizar producto con ID ${id}:`, error);
            throw error;
        }
    }

    // Método para eliminar un producto
    async deleteProduct(id) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`No se pudo eliminar el producto con ID ${id}`);
            }

            // Retorna true si la eliminación fue exitosa
            return true;

        } catch (error) {
            console.error(`Error al eliminar producto con ID ${id}:`, error);
            return false;
        }
    }
}
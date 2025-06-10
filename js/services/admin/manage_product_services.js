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
            // Petición GET para obtener todos los productos
            const response = await fetch(`${this.apiUrl}/productos`, {
                credentials: 'include' // Enviar cookies o token automáticamente si aplica
            });

            // Validar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error('No se pudieron obtener los productos');
            }

            // Retornar la lista de productos en formato JSON
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
            // Petición GET para obtener un producto específico
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                credentials: 'include'
            });

            // Validar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error(`No se pudo obtener el producto con ID ${id}`);
            }

            // Retornar el producto encontrado en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y retorno null si falla
            console.error(`Error al obtener producto con ID ${id}:`, error);
            return null;
        }
    }

    // Método para crear un nuevo producto
    async createProduct(productData) {
        try {
            // Petición POST para crear un nuevo producto
            const response = await fetch(`${this.apiUrl}/productos`, {
                method: 'POST', // Método HTTP POST para crear recurso
                headers: {
                    'Content-Type': 'application/json' // Indica que se envía JSON
                },
                credentials: 'include',
                body: JSON.stringify(productData) // Convertir objeto a JSON
            });

            // Validar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error('No se pudo crear el producto');
            }

            // Retornar el producto creado en formato JSON
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
            // Petición PUT para actualizar un producto
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'PUT', // Método HTTP PUT para actualizar recurso
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newData)
            });

            // Validar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error(`No se pudo actualizar el producto con ID ${id}`);
            }

            // Retornar el producto actualizado en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y relanzamiento para que el llamador lo gestione
            console.error(`Error al actualizar producto con ID ${id}:`, error);
            throw error;
        }
    }

    // Método para eliminar un producto
    async deleteProduct(id) {
        try {
            // Petición DELETE para eliminar un producto
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            // Validar que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error(`No se pudo eliminar el producto con ID ${id}`);
            }

            // Retornar true si la eliminación fue exitosa
            return true;

        } catch (error) {
            // Manejo de errores y retorno false si falla
            console.error(`Error al eliminar producto con ID ${id}:`, error);
            return false;
        }
    }
}
//Importación de la API
import { BASE_API_URL } from "../config";

//Clase para manejar -products-
export class product_services {
    
    constructor() {
        // URL base para conectar con el backend
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos de la clase que permiten conectar el frontend con el backend 

    // Método para obtener todos los productos
    async getAllProducts() {
        try {
            const response = await fetch(`${this.apiUrl}/productos`);

            if (!response.ok) {
                throw new Error('No se pudieron obtener los productos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    }

    // Método para obtener un producto por su ID
    async getProductById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`);

            if (!response.ok) {
                throw new Error(`No se pudo obtener el producto con ID ${id}`);
            }

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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('No se pudo crear el producto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    }

    // Método para actualizar un producto existente
    async updateProduct(id, newData) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });

            if (!response.ok) {
                throw new Error(`No se pudo actualizar el producto con ID ${id}`);
            }

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
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`No se pudo eliminar el producto con ID ${id}`);
            }

            return true;
        } catch (error) {
            console.error(`Error al eliminar producto con ID ${id}:`, error);
            return false;
        }
    }
}

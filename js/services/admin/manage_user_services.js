// Importación de la URL base de la API desde configuración
import { BASE_API_URL } from "../config";

// Clase para manejar operaciones relacionadas con usuarios (lado administrador)
export class UserServices {
    // Constructor que inicializa la URL base del backend
    constructor() {
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos CRUD para interactuar con la API del backend

    // Método para registrar un nuevo usuario (CREATE)
    async registerUser(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios`, {
                method: 'POST', // Método HTTP POST para crear recurso
                headers: {
                    'Content-Type': 'application/json' // Indica que se envía JSON
                },
                credentials: 'include', // Enviar cookies o token automáticamente si aplica
                body: JSON.stringify(userData) // Convierte el objeto a JSON
            });

            if (!response.ok) {
                throw new Error('No se pudo registrar el usuario');
            }

            // Retorna la respuesta convertida a JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores de red o servidor
            console.error('Error al registrar el usuario', error);
            throw error;
        }
    }

    // Método para obtener la lista de todos los usuarios (READ)
    async getAllUser() {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los usuarios');
            }

            // Retorna la lista de usuarios en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y retorno de lista vacía en caso de fallo
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    }

    // Método para obtener un usuario por su ID (READ)
    async getUserById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`No se pudo obtener el usuario con ID ${id}`);
            }

            // Retorna el usuario encontrado en formato JSON
            return await response.json();

        } catch (error) {
            console.error(`Error al obtener el usuario con ID ${id}:`, error);
            return null; // Retorna null si hubo error
        }
    }

    // Método para actualizar la información de un usuario (UPDATE)
    async updateUser(id, newData) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'PUT', // Método HTTP PUT para actualizar recurso
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newData)
            });

            if (!response.ok) {
                throw new Error(`No se pudo actualizar el usuario con ID ${id}`);
            }

            // Retorna el usuario actualizado en formato JSON
            return await response.json();

        } catch (error) {
            console.error(`Error al actualizar el usuario con ID ${id}:`, error);
            throw error;
        }
    }

    // Método para eliminar un usuario por su ID (DELETE)
    async deleteUser(id) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`No se pudo eliminar el usuario con ID ${id}`);
            }

            // Retorna true si la eliminación fue exitosa
            return true;

        } catch (error) {
            console.error(`Error al eliminar el usuario con ID ${id}:`, error);
            return false;
        }
    }
}
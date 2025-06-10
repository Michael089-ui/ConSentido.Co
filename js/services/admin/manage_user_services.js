// Importamos el servicio HTTP centralizado en lugar de usar fetch directamente
import { HttpService } from "../http-service.js";

/**
 * Clase para gestionar operaciones relacionadas con usuarios (panel administrador)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class UserServices {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/usuarios';
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param {Object} userData - Datos del usuario a crear
     * @returns {Promise<Object>} Datos del usuario creado
     */
    async registerUser(userData) {
        try {
            return await this.httpService.post(this.endpoint, userData);
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Obtiene todos los usuarios del sistema
     * @returns {Promise<Array>} Lista de usuarios o array vacío
     */
    async getAllUser() {
        try {
            return await this.httpService.get(this.endpoint);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    }

    /**
     * Obtiene un usuario específico por su ID
     * @param {string} id - ID del usuario a consultar
     * @returns {Promise<Object|null>} Datos del usuario o null si no existe
     */
    async getUserById(id) {
        try {
            return await this.httpService.get(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error(`Error al obtener usuario con ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Actualiza datos de un usuario existente
     * @param {string} id - ID del usuario a actualizar
     * @param {Object} newData - Nuevos datos del usuario
     * @returns {Promise<Object>} Datos actualizados del usuario
     */
    async updateUser(id, newData) {
        try {
            return await this.httpService.put(`${this.endpoint}/${id}`, newData);
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${id}:`, error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Elimina un usuario del sistema
     * @param {string} id - ID del usuario a eliminar
     * @returns {Promise<boolean>} true si se eliminó correctamente
     */
    async deleteUser(id) {
        try {
            await this.httpService.delete(`${this.endpoint}/${id}`);
            return true;
        } catch (error) {
            console.error(`Error al eliminar usuario con ID ${id}:`, error);
            return false;
        }
    }
}
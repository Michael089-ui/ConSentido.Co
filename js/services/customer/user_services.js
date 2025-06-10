import { HttpService } from "../http-service.js";

/**
 * Clase para gestionar operaciones relacionadas con el usuario cliente
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class CustomerUserService {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.endpoint = '/usuarios';
    }

    /**
     * Obtiene el perfil del usuario actualmente autenticado
     * @returns {Promise<Object|null>} - Datos del usuario o null si no existe sesión
     */
    async getCurrentUser() {
        try {
            return await this.httpService.get(`${this.endpoint}/perfil`);
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            return null;
        }
    }
    
    /**
     * Registra un nuevo usuario en el sistema
     * @param {Object} userData - Datos del usuario a registrar
     * @returns {Promise<Object>} - Datos del usuario registrado
     */
    async registerUser(userData) {
        try {
            return await this.httpService.post(`${this.endpoint}/registro`, userData);
        } catch (error) {
            console.error('Error en el registro de usuario:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Actualiza la información del perfil de usuario
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Promise<Object>} - Perfil actualizado
     */
    async updateProfile(userData) {
        try {
            return await this.httpService.put(`${this.endpoint}/actualizar`, userData);
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }

    /**
     * Obtiene el historial de pedidos del usuario
     * @returns {Promise<Array>} - Lista de pedidos del usuario
     */
    async getOrderHistory() {
        try {
            return await this.httpService.get('/pedidos/historial');
        } catch (error) {
            console.error('Error al obtener historial de pedidos:', error);
            throw error; // Re-lanzar para manejar en el componente
        }
    }
}
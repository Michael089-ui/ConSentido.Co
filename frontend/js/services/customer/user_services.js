import { HttpService } from "../http-service.js";
import { AuthService } from "../auth-service.js";

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
        this.authService = new AuthService();
        this.endpoint = '/api/usuarios';
    }

    /**
     * Obtiene el perfil del usuario actualmente autenticado
     * @returns {Promise<Object|null>} - Datos del usuario o null si no existe sesión
     */
    async getCurrentUser() {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            if (!authToken) {
                console.warn('No hay token de autenticación disponible');
                return null;
            }
            
            // Spring Boot suele utilizar /perfil o /me para el usuario actual
            return await this.httpService.get(`${this.endpoint}/perfil`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
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
            // Spring Boot utiliza /auth/register para registro
            return await this.httpService.post(`/auth/register`, userData);
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
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // En Spring Boot generalmente se usa PUT en el endpoint del usuario por ID
            // o en un endpoint específico de perfil
            const currentUser = await this.getCurrentUser();
            
            if (!currentUser || !currentUser.idUsuario) {
                throw new Error('No se pudo obtener el ID del usuario actual');
            }
            
            return await this.httpService.put(`${this.endpoint}/${currentUser.idUsuario}`, userData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
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
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            // Spring Boot suele usar /pedidos/mis-pedidos para el historial del usuario
            return await this.httpService.get('/pedidos/mis-pedidos', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error('Error al obtener historial de pedidos:', error);
            return []; // Es mejor devolver un array vacío que lanzar error
        }
    }
    
    /**
     * Cambia la contraseña del usuario
     * @param {Object} passwordData - Objeto con oldPassword y newPassword
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async changePassword(passwordData) {
        try {
            // Obtener token de autenticación
            const authToken = this.authService.getAuthToken();
            
            return await this.httpService.post(`${this.endpoint}/cambiar-password`, passwordData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    }
}
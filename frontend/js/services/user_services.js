import { HttpService } from "../http-service.js";
import { AuthService } from "../auth-service.js";

/**
 * Servicio para gestionar operaciones relacionadas con usuarios (panel cliente)
 * Utiliza HttpService para centralizar todas las peticiones a la API
 */
export class CustomerUserService {
    /**
     * Constructor que inicializa los servicios necesarios
     */
    constructor() {
        this.httpService = new HttpService();
        this.authService = new AuthService();
        this.endpoint = '/usuarios';
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param {Object} userData - Datos del usuario a registrar
     * @returns {Promise<Object>} Usuario registrado
     */
    async registerUser(userData) {
        try {
            // Verificar si el email ya está registrado
            const existingUsers = await this.httpService.get(`${this.endpoint}?email=${encodeURIComponent(userData.email)}`);
            
            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                throw new Error('Este correo electrónico ya está registrado');
            }
            
            // Preparar datos completos de usuario
            const completeUserData = {
                ...userData,
                id: Date.now().toString(),  // Generar ID único
                rol: 'cliente',             // Rol por defecto
                estado: 'activo'            // Estado por defecto
            };
            
            // Crear el usuario
            const newUser = await this.httpService.post(this.endpoint, completeUserData);
            
            console.log('✅ Usuario registrado correctamente');
            return newUser;
        } catch (error) {
            console.error('Error en el registro de usuario:', error);
            throw error;
        }
    }

    /**
     * Obtiene el perfil del usuario actual
     * @returns {Promise<Object|null>} Datos del usuario o null si no está autenticado
     */
    async getUserProfile() {
        try {
            // Obtener usuario actual desde AuthService
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                return null;
            }
            
            // En un backend real, haríamos una petición para obtener datos actualizados
            // Para JSON Server, usar los datos en caché es suficiente
            return currentUser;
        } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
            return null;
        }
    }

    /**
     * Actualiza el perfil del usuario actual
     * @param {Object} userData - Datos actualizados del usuario
     * @returns {Promise<Object>} Datos actualizados
     */
    async updateUserProfile(userData) {
        try {
            // Obtener usuario actual
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            // Preparar datos actualizados preservando campos existentes
            const updatedUserData = {
                ...currentUser,
                ...userData,
                // No permitir cambiar estos campos desde el panel cliente
                rol: currentUser.rol,
                estado: currentUser.estado
            };
            
            // Actualizar usuario
            const updatedUser = await this.httpService.put(`${this.endpoint}/${currentUser.id}`, updatedUserData);
            
            // Actualizar caché de usuario
            await this.authService.saveUserToStorage(updatedUser);
            
            return updatedUser;
        } catch (error) {
            console.error('Error al actualizar perfil de usuario:', error);
            throw error;
        }
    }

    /**
     * Cambia la contraseña del usuario actual
     * @param {Object} passwordData - Datos con contraseña actual y nueva
     * @returns {Promise<Object>} Resultado de la operación
     */
    async changePassword(passwordData) {
        try {
            // Obtener usuario actual
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            // Obtener datos completos del usuario (incluyendo contraseña actual)
            const fullUserData = await this.httpService.get(`${this.endpoint}/${currentUser.id}`);
            
            // Verificar contraseña actual
            if (fullUserData.password !== passwordData.currentPassword) {
                throw new Error('La contraseña actual es incorrecta');
            }
            
            // Actualizar contraseña
            const updatedUser = await this.httpService.patch(`${this.endpoint}/${currentUser.id}`, {
                password: passwordData.newPassword
            });
            
            return { success: true, message: 'Contraseña actualizada correctamente' };
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    }
}
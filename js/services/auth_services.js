import { HttpService } from './http-service.js';

/**
 * Servicio para gestionar la autenticación y sesión de usuarios
 * Centraliza la lógica relacionada con login, logout y gestión de sesión
 */
export class AuthService {
  constructor() {
    this.httpService = new HttpService();
    // Caché de usuario en memoria para evitar múltiples peticiones
    this.userCache = null;
  }

  /**
   * Iniciar sesión con credenciales
   * @param {Object} credentials - Credenciales de acceso (email, password)
   * @returns {Promise<Object>} - Usuario autenticado
   */
  async login(credentials) {
    try {
      const response = await this.httpService.post('/auth/login', credentials);
      
      // Guardar en caché para reducir peticiones
      this.userCache = response.user;
      
      return response.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión del usuario actual
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Hacer logout en el backend
      await this.httpService.post('/auth/logout', {});
      
      // Limpiar caché
      this.userCache = null;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener el usuario actualmente autenticado
   * @param {boolean} forceRefresh - Si debe forzar una nueva petición al backend
   * @returns {Promise<Object|null>} - Usuario autenticado o null si no hay sesión
   */
  async getCurrentUser(forceRefresh = false) {
    try {
      // Si tenemos en caché y no se pide refresh, devolver de caché
      if (this.userCache && !forceRefresh) {
        return this.userCache;
      }
      
      // Obtener del backend
      const response = await this.httpService.get('/usuarios/perfil');
      
      // Actualizar caché
      this.userCache = response;
      
      return response;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      this.userCache = null;
      return null;
    }
  }

  /**
   * Verificar si hay un usuario autenticado
   * @returns {Promise<boolean>} - true si hay usuario autenticado
   */
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Verificar si el usuario actual tiene rol de administrador
   * @returns {Promise<boolean>} - true si el usuario es administrador
   */
  async isAdmin() {
    const user = await this.getCurrentUser();
    return user && user.rol === 'admin';
  }
}
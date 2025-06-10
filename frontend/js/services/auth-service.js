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
    
    // Cargar usuario desde localStorage si existe (para persistencia entre recargas)
    this.loadUserFromStorage();
    
    // Para cuando migres a backend desplegado, puedes descomentar este código:
    /*
    this.deployedMode = false; // Cambiar a true cuando uses backend desplegado
    */
  }
  
  /**
   * Cargar usuario desde localStorage si existe
   */
  loadUserFromStorage() {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        this.userCache = JSON.parse(savedUser);
        console.log('🔐 Usuario cargado desde almacenamiento local');
      }
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error);
      this.clearStoredAuth();
    }
  }

  /**
   * Guardar usuario en localStorage para persistencia entre recargas
   * @param {Object|null} user - Usuario a guardar o null para limpiar
   * @param {string|null} token - Token JWT a guardar o null para limpiar
   */
  saveAuthToStorage(user, token) {
    if (user && token) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
    } else {
      this.clearStoredAuth();
    }
  }
  
  /**
   * Limpiar datos de autenticación del almacenamiento local
   */
  clearStoredAuth() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.userCache = null;
  }

  /**
   * Iniciar sesión con credenciales
   * @param {Object} credentials - Credenciales de acceso (email, password)
   * @returns {Promise<Object>} - Usuario autenticado
   */
  async login(credentials) {
    try {
      // Spring Boot generalmente espera un objeto con username y password
      const loginData = {
        username: credentials.email, // Spring Security suele usar 'username'
        password: credentials.password
      };
      
      // Llamar al endpoint de login de Spring Boot
      const response = await this.httpService.post('/auth/login', loginData);
      
      // Spring Boot generalmente devuelve un objeto con token y datos de usuario
      if (response && response.token) {
        // Guardar token en localStorage y configurar headers para futuras peticiones
        this.saveAuthToStorage(response.user || response.usuario, response.token);
        
        // Actualizar caché de usuario
        this.userCache = response.user || response.usuario;
        
        console.log('🔐 Usuario autenticado:', this.userCache.nombre || this.userCache.name);
        
        return this.userCache;
      } else {
        throw new Error('Respuesta de autenticación inválida');
      }
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
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Intentar hacer logout en el servidor
        try {
          await this.httpService.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (e) {
          // Si falla el logout en servidor, solo continuamos con el logout local
          console.warn('No se pudo hacer logout en el servidor:', e);
        }
      }
      
      // Limpiar datos de autenticación locales
      this.clearStoredAuth();
      
      console.log('🔒 Sesión cerrada');
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún si hay error, limpiamos localmente
      this.clearStoredAuth();
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
      // Si tenemos usuario en caché y no se solicita actualización, devolverlo
      if (this.userCache && !forceRefresh) {
        return this.userCache;
      }
      
      // Verificar si hay token
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }
      
      // Hacer petición al endpoint de perfil con el token como header
      const response = await this.httpService.get('/api/usuarios/perfil', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar caché si obtuvimos un perfil
      if (response) {
        this.userCache = response;
        // Actualizar solo los datos del usuario en storage, manteniendo el token
        localStorage.setItem('currentUser', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      
      // Si hay error de autenticación (401), limpiar datos locales
      if (error.status === 401) {
        this.clearStoredAuth();
      }
      
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
    // Adaptado para trabajar con la estructura de roles de Spring Security
    return user && (user.rol === 'ROLE_ADMIN' || user.rol === 'admin' || 
           (user.roles && user.roles.includes('ROLE_ADMIN')));
  }

  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} - Usuario registrado
   */
  async register(userData) {
    try {
      // Asignar rol cliente por defecto si no se especifica
      if (!userData.rol) {
        userData.rol = 'ROLE_USER'; // Usar formato de Spring Security
      }
      
      // Spring Boot generalmente espera un endpoint específico para registro
      const response = await this.httpService.post('/auth/register', userData);
      
      console.log('👤 Usuario registrado exitosamente');
      
      // Si el backend inicia sesión automáticamente tras registro
      if (response.token) {
        this.saveAuthToStorage(response.user || response.usuario, response.token);
        this.userCache = response.user || response.usuario;
      }
      
      return response;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }
  
  /**
   * Obtener el token de autenticación actual
   * @returns {string|null} - Token JWT o null si no hay
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }
  
  /**
   * Añadir el token de autenticación a las cabeceras de una petición
   * @param {Object} options - Opciones de la petición
   * @returns {Object} - Opciones con cabecera de autenticación si hay token
   */
  addAuthHeader(options = {}) {
    const token = this.getAuthToken();
    if (!token) return options;
    
    return {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    };
  }
}
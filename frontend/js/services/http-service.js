/**
 * Servicio para manejar peticiones HTTP a la API
 * Centraliza la lógica de fetch, manejo de errores y headers
 */

export class HttpService {
  constructor() {
    // URL del backend Spring Boot local
    this.baseUrl = 'http://localhost:8080';
    
    // Timeout para peticiones en milisegundos
    this.requestTimeout = 10000; // 10 segundos
    
    // Mapa de rutas según la estructura del backend Spring Boot
    this.routeMap = {
      // Para backend Spring Boot local
      'usuarios': '/api/usuarios',
      'usuario': '/api/usuarios',
      'productos': '/api/productos',  // Corregido con prefijo /api/
      'producto': '/api/productos',   // Corregido con prefijo /api/
      'categorias': '/api/categorias', // Corregido con prefijo /api/
      'categoria': '/api/categorias',  // Corregido con prefijo /api/
      'auth': '/api/auth',             // Corregido con prefijo /api/
      'pedidos': '/api/pedidos',       // Corregido con prefijo /api/
      'pedido': '/api/pedidos',        // Corregido con prefijo /api/
      'inventario': '/api/inventario', // Corregido con prefijo /api/
      'detalles-pedido': '/api/detalles-pedido', // Corregido con prefijo /api/
      'carrito': '/api/carrito'
    };
  }

  /**
   * Mapea un endpoint a la ruta correcta según la estructura del backend
   * @param {string} endpoint - Ruta original
   * @returns {string} - Ruta mapeada
   */
  mapEndpoint(endpoint) {
    // Normalizar: remover barra inicial si existe
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Obtener la primera parte de la ruta (antes de la siguiente barra)
    const firstSegment = path.split('/')[0];
    
    // Si hay un mapeo para esta ruta, usarlo
    if (this.routeMap[firstSegment]) {
      // Obtener el resto del path después del primer segmento
      const restOfPath = path.includes('/') ? path.substring(path.indexOf('/')) : '';
      return this.routeMap[firstSegment] + restOfPath;
    }
    
    // Si no hay mapeo específico, añadir prefijo /api/ por defecto
    return endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
  }

  /**
   * Realiza peticiones HTTP con configuración estándar
   * @param {string} endpoint - Ruta relativa a la base URL
   * @param {Object} options - Opciones para fetch (method, body, etc)
   * @returns {Promise<any>} - Respuesta de la API
   */
  async request(endpoint, options = {}) {
    try {
      // Mapear al endpoint correcto según la estructura del backend
      const mappedEndpoint = this.mapEndpoint(endpoint);
      
      // Construir URL completa
      const url = `${this.baseUrl}${mappedEndpoint}`;
      
      console.log(`🔍 Realizando petición a: ${url}`);

      // Configuración por defecto
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Agregar token de autenticación si está disponible
      const token = localStorage.getItem('authToken');
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Si hay un body y es un objeto, convertirlo a JSON
      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      config.signal = controller.signal;

      const response = await fetch(url, config);

      clearTimeout(timeoutId);

      // Manejar respuesta no exitosa
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Error ${response.status}: ${response.statusText}` };
        }

        throw {
          status: response.status,
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          data: errorData
        };
      }

      // Si la respuesta está vacía, devolver objeto vacío
      if (response.status === 204) {
        return {};
      }

      // Convertir respuesta a JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return { content: text };
      }
    } catch (error) {
      // Error específico de conexión
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`❌ Error de conexión: ¿Está ejecutándose el backend Spring Boot? Verifica que está activo en ${this.baseUrl}`);
        this.showLocalServerErrorMessage();
      } else if (error.name === 'AbortError') {
        console.error(`⏱️ Tiempo de espera agotado. El servidor no respondió a tiempo.`);
      } else {
        console.error(`❌ Error en petición a ${endpoint}:`, error);
      }
      
      throw error;
    }
  }

  /**
   * Muestra un mensaje cuando el servidor local no está disponible
   */
  showLocalServerErrorMessage() {
    // Solo mostrar el mensaje una vez por sesión
    if (document.getElementById('api-unavailable-message')) return;
    
    const messageElement = document.createElement('div');
    messageElement.id = 'api-unavailable-message';
    messageElement.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3';
    messageElement.style.zIndex = '9999';
    messageElement.style.maxWidth = '80%';
    messageElement.innerHTML = `
      <strong>⚠️ Backend no disponible</strong>
      <p>No se puede conectar con el servidor Spring Boot local. Asegúrate que:</p>
      <ul>
        <li>Has iniciado el backend con <code>mvn spring-boot:run</code></li>
        <li>El servidor está corriendo en <code>http://localhost:8080</code></li>
        <li>MySQL está activo y configurado correctamente</li>
      </ul>
      <button class="btn btn-sm btn-outline-dark" onclick="location.reload()">Reintentar</button>
      <button class="btn btn-sm btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(messageElement);
    
    // Auto-eliminar después de 30 segundos
    setTimeout(() => {
      const message = document.getElementById('api-unavailable-message');
      if (message) message.remove();
    }, 30000);
  }

  /**
   * Realiza una petición GET
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise<any>} - Datos de respuesta
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise<any>} - Datos de respuesta
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data
    });
  }

  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise<any>} - Datos de respuesta
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    });
  }

  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise<any>} - Datos de respuesta
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Realiza una petición PATCH
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise<any>} - Datos de respuesta
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data
    });
  }
}

// Exportar instancia por defecto para uso global
export default new HttpService();
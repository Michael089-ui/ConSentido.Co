/**
 * Servicio para manejar peticiones HTTP a la API
 * Centraliza la lógica de fetch, manejo de errores y headers
 */

export class HttpService {
  constructor() {
    // ===== CONFIGURACIÓN PARA BACKEND SPRING BOOT LOCAL =====
    this.useLocalBackend = true; // Controla si usamos backend local o remoto
    
    // URL del backend Spring Boot local
    this.springBootUrl = 'http://localhost:8080';
    
    // Para todas las rutas usamos el mismo backend Spring Boot
    this.localBaseUrls = {
      'default': this.springBootUrl
    };
    
    // ===== CONFIGURACIÓN PARA BACKEND DESPLEGADO (COMENTADO) =====
    // Cuando el backend en AWS esté disponible, descomentar esta sección
    /*
    this.baseUrl = "https://kpn9ajcasp.us-east-1.awsapprunner.com";
    this.apiAvailable = null; // Aún no verificado
    this.lastCheckTime = 0;
    */
    
    // Mapa de rutas según la estructura del backend Spring Boot
    this.routeMap = {
      // Para backend Spring Boot local
      'usuarios': '/api/usuarios',
      'usuario': '/api/usuarios',
      'productos': '/productos',
      'producto': '/productos',
      'categorias': '/categorias',
      'categoria': '/categorias',
      'auth': '/auth',
      'pedidos': '/pedidos',
      'pedido': '/pedidos',
      'inventario': '/inventario',
      'detalles-pedido': '/detalles-pedido',
      'carrito': '/api/carrito'
    };
    
    // Para JSON Server (comentado)
    /*
    this.routeMap = {
      'usuarios': '/usuarios',
      'usuario': '/usuarios',
      'productos': '/productos',
      'producto': '/productos',
      'categorias': '/categorias',
      'categoria': '/categorias',
      'auth': '/auth',
      'pedidos': '/pedidos',
      'pedido': '/pedidos',
      'inventario': '/productos',
      'detalles-pedido': '/detalles-pedido',
      'carrito': '/carrito'
    }
    */
  }

  /**
   * Obtiene la URL base adecuada según el tipo de recurso
   * @param {string} endpoint - Endpoint de la petición
   * @returns {string} - URL base correspondiente
   */
  getBaseUrl(endpoint) {
    if (!this.useLocalBackend) {
      // Modo backend desplegado (comentado por ahora)
      // return this.baseUrl;
      console.error('Backend desplegado no está configurado');
      throw new Error('Backend desplegado no está configurado');
    }
    
    // Para Spring Boot local, siempre usamos la misma URL base
    return this.springBootUrl;
  }

  /**
   * Mapea un endpoint a la ruta correcta según la estructura del backend
   */
  mapEndpoint(endpoint) {
    // Normalizar: remover barra inicial si existe
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Obtener la primera parte de la ruta (antes de la siguiente barra)
    const firstSegment = path.split('/')[0];
    
    // Si hay un mapeo para esta ruta, usarlo
    if (this.routeMap[firstSegment]) {
      const restOfPath = path.substring(firstSegment.length);
      return this.routeMap[firstSegment] + restOfPath;
    }
    
    // Si no hay mapeo, devolver el endpoint original con barra inicial
    return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  }

  /**
   * Realiza peticiones HTTP con configuración estándar
   * @param {string} endpoint - Ruta relativa a la base URL
   * @param {Object} options - Opciones para fetch (method, body, etc)
   * @returns {Promise<any>} - Respuesta de la API
   */
  async request(endpoint, options = {}) {
    try {
      // Para backend desplegado (comentado)
      /*
      const isApiAvailable = await this.checkApiAvailability();
      if (!isApiAvailable) {
        throw new Error('El servicio backend no está disponible en este momento');
      }
      */
      
      // Mapear al endpoint correcto según la estructura del backend
      const mappedEndpoint = this.mapEndpoint(endpoint);
      
      // Obtener la URL base adecuada (local o remota)
      const baseUrl = this.getBaseUrl(endpoint);
      
      // Construir URL completa
      const url = `${baseUrl}${mappedEndpoint}`;
      
      console.log(`🔍 Realizando petición a: ${url}`);

      // Configuración por defecto
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Si hay un body y es un objeto, convertirlo a JSON
      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos máximo

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
      const data = await response.json();
      return data;
    } catch (error) {
      // Error específico de conexión
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`❌ Error de conexión: ¿Está ejecutándose el backend Spring Boot? Verifica que está activo en http://localhost:8080`);
      } else if (error.name === 'AbortError') {
        console.error(`⏱️ Tiempo de espera agotado. El servidor no respondió a tiempo.`);
      } else {
        console.error(`❌ Error en petición a ${endpoint}:`, error);
      }
      
      this.showLocalServerErrorMessage();
      
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
  }

  // Métodos helper para cada tipo de petición
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data
    });
  }
}
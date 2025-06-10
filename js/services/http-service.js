/**
 * Servicio para manejar peticiones HTTP a la API
 * Centraliza la lógica de fetch, manejo de errores y headers
 */


export class HttpService {
  constructor() {
    this.baseUrl = "https://kpn9ajcasp.us-east-1.awsapprunner.com";

    this.apiAvailable = null; // Aún no verificado
    this.lastCheckTime = 0;

    // Mapa de rutas según la estructura real del backend
    this.routeMap = {
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

    this.checkApiAvailability();

  }

  async checkApiAvailability() {
    // Solo verificar una vez cada 60 segundos
    const now = Date.now();
    if (this.apiAvailable !== null && now - this.lastCheckTime < 60000) {
      return this.apiAvailable;
    }

    try {
      // Intenta hacer un ping simple al servidor
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos máximo

      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      this.apiAvailable = response.ok;
      this.lastCheckTime = now;

      console.log(`🌐 API ${this.apiAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);

      return this.apiAvailable;
    } catch (error) {
      console.warn('❌ API no disponible:', error.message);
      this.apiAvailable = false;
      this.lastCheckTime = now;
      return false;
    }
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

      const isApiAvailable = await this.checkApiAvailability();
      if (!isApiAvailable) {
        throw new Error('El servicio backend no está disponible en este momento');
      }

      // Mapear al endpoint correcto según la configuración del backend
      const mappedEndpoint = this.mapEndpoint(endpoint);
      const url = `${this.baseUrl}${mappedEndpoint}`;

      console.log(`🔍 Realizando petición a: ${url}`);

      // Configuración por defecto
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include', // Enviar cookies automáticamente
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
        console.error(`❌ Error de conexión al servidor backend. Verifique su conexión a internet o contacte al administrador del sitio.`);
        this.apiAvailable = false; // Marcar como no disponible
      } else if (error.name === 'AbortError') {
        console.error(`⏱️ Tiempo de espera agotado. El servidor no respondió a tiempo.`);
        this.apiAvailable = false; // Marcar como no disponible
      } else {
        console.error(`❌ Error en petición a ${endpoint}:`, error);
      }
      
      // Mostrar un mensaje en la interfaz para informar al usuario
      this.showServiceUnavailableMessage();
      
      throw error;
    }
  }

  showServiceUnavailableMessage() {
    // Solo mostrar el mensaje una vez por sesión
    if (document.getElementById('api-unavailable-message')) return;
    
    const messageElement = document.createElement('div');
    messageElement.id = 'api-unavailable-message';
    messageElement.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3';
    messageElement.style.zIndex = '9999';
    messageElement.style.maxWidth = '80%';
    messageElement.innerHTML = `
      <strong>⚠️ Servicio no disponible</strong>
      <p>No se puede conectar con el servidor backend. Algunas funciones no estarán disponibles.</p>
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
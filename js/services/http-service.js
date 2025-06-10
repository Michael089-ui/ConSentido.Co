
// Servicio para manejar peticiones HTTP a la API
// Centraliza la lógica de fetch, manejo de errores y headers


export class HttpService {
  constructor() {
    this.baseUrl = "https://kpn9ajcasp.us-east-1.awsapprunner.com";

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
      'inventario': '/inventario',
      'detalles-pedido': '/detalles-pedido'
    };
  }


  mapEndpoint(endpoint) {
    // Remover barra inicial si existe
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Obtener la primera parte de la ruta (antes de la siguiente barra)
    const firstSegment = path.split('/')[0];
    
    // Si hay un mapeo para esta ruta, usarlo
    if (this.routeMap[firstSegment]) {
      const restOfPath = path.substring(firstSegment.length);
      return this.routeMap[firstSegment] + restOfPath;
    }
    
    // Si no hay mapeo, devolver el endpoint original
    return endpoint;
  }

  /**
   * Realiza peticiones HTTP con configuración estándar
   * @param {string} endpoint - Ruta relativa a la base URL
   * @param {Object} options - Opciones para fetch (method, body, etc)
   * @returns {Promise<any>} - Respuesta de la API
   */
  async request(endpoint, options = {}) {

    // Mapear al endpoint correcto según la configuración del backend
    const mappedEndpoint = this.mapEndpoint(endpoint);
    const URL = `${this.baseUrl}${mappedEndpoint}`;
    
    console.log(`Realizando petición a: ${url}`);

    // Asegurarse que el endpoint comience con /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    const url = `${this.baseUrl}${endpoint}`;

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

    try {
      const response = await fetch(url, config);

      // Manejar respuesta no exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error de servidor'
        }));

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
      return await response.json();
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error);
      throw error;
    }
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
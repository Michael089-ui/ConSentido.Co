// Importación del servicio UI centralizado
import { UIService } from '../services/ui-service.js';

/**
 * Clase para gestionar la carga dinámica de secciones en la interfaz administrativa
 * Maneja la carga, caché y visualización de las plantillas HTML para el panel de administración
 */
export class TemplateManager {
    /**
     * Constructor de la clase TemplateManager
     * Inicializa el sistema de caché y servicios necesarios
     */
    constructor() {
        // Objeto para almacenar templates cargados en caché para mejorar rendimiento
        this.templates = {};
        
        // Rutas base para las secciones del panel administrativo (primaria y alternativa)
        this.basePath = '/frontend/pages/admin/section/';
        this.altPath = '../../pages/admin/section/';
        
        // Instanciar el servicio UI para mensajes y carga
        this.uiService = new UIService();
        
        // Tiempo de expiración de caché en milisegundos (30 minutos)
        this.cacheExpiration = 1800000;
        
        // Almacena timestamps de cuándo se cargó cada sección
        this.cacheTimestamps = {};
    }

    /**
     * Carga el contenido HTML de una sección específica
     * Utiliza caché para mejorar el rendimiento si la sección ya fue cargada antes
     * @param {string} section - Nombre de la sección a cargar
     * @returns {Promise<string>} - Contenido HTML de la sección
     */
    async loadSection(section) {
        try {
            // Verificar si ya tenemos esta sección en caché y no ha expirado
            const now = Date.now();
            if (
                this.templates[section] && 
                this.cacheTimestamps[section] && 
                now - this.cacheTimestamps[section] < this.cacheExpiration
            ) {
                return this.templates[section];
            }

            // Mapeo de nombres de sección a archivos HTML correspondientes
            const sectionFiles = {
                'inventario': 'inventory',
                'pedidos': 'orders',
                'usuarios': 'users',
                'perfil': 'profile',
                'dashboard': 'dashboard'
            };
            
            // Obtiene el nombre del archivo según la sección, o usa el nombre tal cual
            const fileName = sectionFiles[section] || section;

            // Intenta cargar desde la ruta principal, si falla prueba con la ruta alternativa
            let response;
            try {
                const url = `${this.basePath}${fileName}.html`;
                response = await fetch(url);
                if (!response.ok) throw new Error(`Error con ruta principal: ${response.status}`);
            } catch (primaryError) {
                try {
                    // Intentar con ruta alternativa
                    const url = `${this.altPath}${fileName}.html`;
                    response = await fetch(url);
                    if (!response.ok) throw new Error(`Error con ruta alternativa: ${response.status}`);
                } catch (altError) {
                    // Si ambas rutas fallan, lanzar un error combinado
                    throw new Error(`No se pudo cargar la sección desde ninguna ruta disponible.`);
                }
            }

            // Obtiene el contenido HTML como texto
            const html = await response.text();
            
            // Guarda en caché con timestamp actual
            this.templates[section] = html;
            this.cacheTimestamps[section] = now;

            // Retorna el contenido HTML
            return html;

        } catch (error) {
            // Manejo de errores en la carga de la sección
            console.error(`Error cargando sección ${section}:`, error);

            // Retorna un mensaje HTML de error para mostrar en la interfaz
            return this.getErrorTemplate(section, error.message);
        }
    }

    /**
     * Genera un template HTML de error consistente
     * @param {string} section - Nombre de la sección que falló
     * @param {string} errorDetails - Detalles específicos del error
     * @returns {string} - HTML formateado con el mensaje de error
     */
    getErrorTemplate(section, errorDetails = '') {
        return `
            <div class="alert alert-danger m-4">
                <h4 class="alert-heading">Error al cargar sección</h4>
                <p>No se pudo cargar la sección "${section}". Por favor intente nuevamente.</p>
                ${errorDetails ? `<p class="small text-muted">${errorDetails}</p>` : ''}
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mb-0">Si el problema persiste, contacte al administrador del sistema.</p>
                    <button class="btn btn-outline-danger" onclick="window.adminManager.cargarSeccion('${section}')">
                        <i class="fas fa-sync-alt me-1"></i> Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Muestra un indicador de carga en un contenedor dado
     * @param {HTMLElement} container - Contenedor donde mostrar el indicador
     */
    showLoading(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;
    }

    /**
     * Muestra un mensaje de error en un contenedor específico
     * @param {HTMLElement} container - Contenedor donde mostrar el error
     * @param {string} message - Mensaje de error a mostrar
     */
    showError(container, message) {
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-danger m-4">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button class="btn btn-sm btn-outline-danger float-end" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
        
        // También mostrar mensaje global
        if (this.uiService) {
            this.uiService.showMessage(message, 'danger');
        }
    }

    /**
     * Limpia toda la caché de templates almacenada
     */
    clearCache() {
        this.templates = {};
        this.cacheTimestamps = {};
        console.log('Caché de plantillas limpiada completamente');
    }
    
    /**
     * Limpia la caché para una sección específica
     * @param {string} section - Nombre de la sección a limpiar
     */
    clearSectionCache(section) {
        if (this.templates[section]) {
            delete this.templates[section];
            delete this.cacheTimestamps[section];
            console.log(`Caché limpiada para la sección: ${section}`);
        }
    }
    
    /**
     * Recarga forzosamente una sección, ignorando la caché existente
     * @param {string} section - Nombre de la sección a recargar
     * @returns {Promise<string>} - Contenido HTML actualizado de la sección
     */
    async refreshSection(section) {
        this.clearSectionCache(section);
        return await this.loadSection(section);
    }
    
    /**
     * Precarga las secciones más comunes para mejorar la experiencia de usuario
     * Carga en segundo plano para tener disponibles las secciones principales
     */
    async preloadCommonSections() {
        try {
            const commonSections = ['inventario', 'pedidos', 'usuarios'];
            const loadPromises = commonSections.map(section => this.loadSection(section));
            await Promise.all(loadPromises);
            console.log('Secciones comunes precargadas correctamente');
        } catch (error) {
            console.warn('Error al precargar secciones:', error);
        }
    }
}
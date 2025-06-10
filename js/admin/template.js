// Clase para gestionar la carga dinámica de secciones en la interfaz administrativa
export class TemplateManager {
    constructor() {
        // Objeto para almacenar templates cargados en caché para mejorar rendimiento
        this.templates = {};
        // Ruta base para las secciones del panel administrativo
        this.basePath = '/pages/admin/section/';
    }

    // Método para cargar el contenido HTML de una sección dada
    // Usa cache si la sección ya fue cargada previamente
    async loadSection(section) {
        try {
            // Verificar si ya tenemos esta sección en caché
            if (this.templates[section]) {
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

            // Construye la URL completa para la petición
            const url = `${this.basePath}${fileName}.html`;

            // Realiza la petición para obtener el archivo HTML de la sección
            const response = await fetch(url);

            // Verifica que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error(`Error cargando sección ${section}: ${response.status} ${response.statusText}`);
            }

            // Obtiene el contenido HTML como texto
            const html = await response.text();
            
            // Guarda en caché para futuras referencias
            this.templates[section] = html;

            // Retorna el contenido HTML
            return html;

        } catch (error) {
            // Manejo de errores en la carga de la sección
            console.error(`Error cargando sección ${section}:`, error);

            // Retorna un mensaje HTML de error para mostrar en la interfaz
            return `
                <div class="alert alert-danger m-4">
                    <h4 class="alert-heading">Error al cargar sección</h4>
                    <p>No se pudo cargar la sección "${section}". Por favor intente nuevamente.</p>
                    <hr>
                    <p class="mb-0">Si el problema persiste, contacte al administrador del sistema.</p>
                </div>
            `;
        }
    }

    // Método para mostrar un indicador de carga en un contenedor dado
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

    // Método para mostrar un mensaje de error en un contenedor dado
    showError(container, message) {
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-danger m-4">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }

    // Método para limpiar la caché de templates
    // Útil cuando se necesita recargar contenido actualizado
    clearCache() {
        this.templates = {};
    }
    
    // Método para precargar secciones comunes y mejorar la experiencia de usuario
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
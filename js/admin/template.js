// Clase para gestionar la carga dinámica de secciones en la interfaz administrativa
export class TemplateManager {
    constructor() {
        // Objeto para almacenar templates cargados si se desea cachear (actualmente no usado)
        this.templates = {};
    }

    // Método para cargar el contenido HTML de una sección dada
    async loadSection(section) {
        try {
            // Mapeo de nombres de sección a archivos HTML correspondientes
            const sectionFiles = {
                'inventario': 'inventory',
                'pedidos': 'orders',
                'usuarios': 'users',
                'perfil': 'profile'
            };
            
            // Obtiene el nombre del archivo según la sección, o usa el nombre tal cual
            const fileName = sectionFiles[section] || section;

            // Realiza la petición para obtener el archivo HTML de la sección
            const response = await fetch(`/pages/admin/section/${fileName}.html`);

            // Verifica que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error(`Error cargando sección: ${response.statusText}`);
            }

            // Retorna el contenido HTML como texto
            return await response.text();

        } catch (error) {
            // Manejo de errores en la carga de la sección
            console.error('Error loading section:', error);

            // Retorna un mensaje HTML de error para mostrar en la interfaz
            return `
                <div class="alert alert-danger m-4">
                    Error al cargar la sección. Por favor intente nuevamente.
                </div>
            `;
        }
    }

    // Método para mostrar un indicador de carga en un contenedor dado
    showLoading(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border" role="status">
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
                ${message}
            </div>
        `;
    }
}
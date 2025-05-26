export class TemplateManager {
    constructor() {
        this.templates = {};
    }

    async loadSection(section) {
        try {
            // Mapear las rutas a los nombres de archivo correctos
            const sectionFiles = {
                'inventario': 'inventory',
                'pedidos': 'orders',
                'usuarios': 'users',
                'perfil': 'profile'
            };
            
            const fileName = sectionFiles[section] || section;
            const response = await fetch(`/pages/admin/section/${fileName}.html`);
            
            if (!response.ok) {
                throw new Error(`Error cargando sección: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading section:', error);
            return `
                <div class="alert alert-danger m-4">
                    Error al cargar la sección. Por favor intente nuevamente.
                </div>
            `;
        }
    }

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

    showError(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="alert alert-danger m-4">
                ${message}
            </div>
        `;
    }
}
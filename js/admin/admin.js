import { SidebarManager } from './sidebar.js';
import { ProductosManager } from './inventory.js';
import { TemplateManager } from './orders.js';

class AdminManager {
    constructor() {
        this.verificarAdmin();
        this.productosManager = new ProductosManager();
        this.templateManager = new TemplateManager();
        this.sidebarManager = new SidebarManager();
        this.init();
    }

    verificarAdmin() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.rol !== 'admin') {
            window.location.href = '/pages/customer/Login.html';
            return false;
        }
        return true;
    }

    init() {
        this.setupEventListeners();
        // Cambiar la sección inicial a inventario
        this.loadInitialSection();
    }

    setupEventListeners() {
        document.addEventListener('sidebarNavigation', (e) => {
            this.cargarSeccion(e.detail.section);
        });
    }

    loadInitialSection() {
        // Cargar directamente inventario en lugar de dashboard
        this.cargarSeccion('inventario');
    }

    cargarSeccion(seccion) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        // Ocultar bienvenida
        const bienvenida = document.getElementById('bienvenida');
        if (bienvenida) {
            bienvenida.style.display = 'none';
        }

        // Cargar sección
        this.templateManager.loadSection(seccion)
            .then(html => {
                contentContainer.innerHTML = html;
                this.initializeSectionFeatures(seccion);
            })
            .catch(error => this.mostrarError(error.message));
    }

    initializeSectionFeatures(seccion) {
        if (seccion === 'inventario') {
            this.productosManager.init();
        }
    }

    handleGlobalError(e) {
        console.error('Error en la aplicación:', e.error);
        this.mostrarAlerta('Ha ocurrido un error en la aplicación', 'danger');
    }

    static cerrarSesion() {
        if(confirm('¿Está seguro de cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/customer/Login.html';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
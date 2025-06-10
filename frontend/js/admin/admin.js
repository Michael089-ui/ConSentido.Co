import { SidebarManager } from './sidebar.js';
import { InventoryManager } from './inventory.js';
import { OrdersManager } from './orders.js';
import { UsersManager } from './users.js';
import { TemplateManager } from './template.js';

class AdminManager {
    constructor() {
        this.verificarAdmin();
        this.templateManager = new TemplateManager();
        this.sidebarManager = new SidebarManager();
        this.productosManager = new InventoryManager();
        this.OrdersManager = new OrdersManager();
        this.usersManager = new UsersManager(); // Cambiar a minúscula


        this.init();
    }

    verificarAdmin() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.rol !== 'admin') {
            window.location.href = '/pages/customer/login.html';
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
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = `
                    <div class="alert alert-danger m-4">
                        Error al cargar la sección. Por favor intente nuevamente.
                    </div>
                `;
            });
    }

    mostrarError(mensaje) {
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="alert alert-danger m-4">
                    ${mensaje}
                </div>
            `;
        }
    }

    initializeSectionFeatures(seccion) {
        switch(seccion) {
            case 'inventario':
                this.productosManager.init();
                break;
            case 'usuarios':
                this.usersManager.init(); // Cambiar a minúscula
                break;
            case 'pedidos':
                this.OrdersManager.init();
                break;
        }
    }

    handleGlobalError(e) {
        console.error('Error en la aplicación:', e.error);
        this.mostrarAlerta('Ha ocurrido un error en la aplicación', 'danger');
    }

    static cerrarSesion() {
        if (confirm('¿Está seguro de cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/customer/Login.html';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
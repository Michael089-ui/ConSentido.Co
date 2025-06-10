import { SidebarManager } from './sidebar.js';
import { InventoryManager } from './inventory.js';
import { OrdersManager } from './orders.js';
import { UsersManager } from './users.js';
import { TemplateManager } from './template.js';
import { AuthService } from '../services/auth-service.js';

export class AdminManager {
    constructor() {
        // Inicializar el servicio de autenticación
        this.authService = new AuthService();
        
        // Verificar permisos antes de inicializar los componentes
        if (!this.verificarAdmin()) return;
        
        // Inicializar componentes del panel de administración
        this.templateManager = new TemplateManager();
        this.sidebarManager = new SidebarManager();
        this.productosManager = new InventoryManager();
        this.ordersManager = new OrdersManager();
        this.usersManager = new UsersManager();

        this.init();
    }

    // Verifica que el usuario actual sea administrador, consultando el token de sesión
    // Si el usuario no tiene permisos, redirige al login
    async verificarAdmin() {
        const currentUser = await this.authService.getCurrentUser();
        if (!currentUser || currentUser.rol !== 'admin') {
            window.location.href = '../customer/login.html';
            return false;
        }
        return true;
    }

    // Inicializa el panel de administración configurando los eventos
    // y cargando la sección inicial
    init() {
        this.setupEventListeners();
        this.loadInitialSection();
    }

    // Configura los eventos globales del panel de administración
    // principalmente para la navegación entre secciones
    setupEventListeners() {
        document.addEventListener('sidebarNavigation', (e) => {
            this.cargarSeccion(e.detail.section);
        });

        // Configurar evento para manejar errores globales
        window.addEventListener('error', this.handleGlobalError.bind(this));
    }

    // Carga la sección inicial del panel (inventario)
    loadInitialSection() {
        this.cargarSeccion('inventario');
    }

    // Carga el contenido HTML de la sección seleccionada
    // e inicializa las funcionalidades específicas
    cargarSeccion(seccion) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        // Ocultar mensaje de bienvenida si existe
        const bienvenida = document.getElementById('bienvenida');
        if (bienvenida) {
            bienvenida.style.display = 'none';
        }

        // Cargar el contenido HTML de la sección usando el TemplateManager
        this.templateManager.loadSection(seccion)
            .then(html => {
                contentContainer.innerHTML = html;
                this.initializeSectionFeatures(seccion);
            })
            .catch(error => {
                console.error('Error al cargar sección:', error);
                contentContainer.innerHTML = `
                    <div class="alert alert-danger m-4">
                        Error al cargar la sección. Por favor intente nuevamente.
                    </div>
                `;
            });
    }

    // Inicializa las funcionalidades específicas de cada sección
    // delegando la responsabilidad al manager correspondiente
    initializeSectionFeatures(seccion) {
        switch(seccion) {
            case 'inventario':
                this.productosManager.init();
                break;
            case 'usuarios':
                this.usersManager.init();
                break;
            case 'pedidos':
                this.ordersManager.init();
                break;
            default:
                console.warn(`Sección no reconocida: ${seccion}`);
        }
    }

    // Muestra un mensaje de error en el contenedor principal
    // útil para mostrar errores críticos al usuario
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

    // Maneja errores globales no capturados de la aplicación
    // y muestra un mensaje amigable al usuario
    handleGlobalError(e) {
        console.error('Error en la aplicación:', e.error);
        this.mostrarAlerta('Ha ocurrido un error en la aplicación', 'danger');
    }

    // Método para mostrar alertas en la interfaz
    mostrarAlerta(mensaje, tipo) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;
        const container = document.querySelector('.content');
        if (container) {
            container.prepend(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Método estático para cerrar sesión con confirmación
    // Usa el AuthService para limpiar la sesión de forma segura
    static cerrarSesion() {
        if (confirm('¿Está seguro de cerrar sesión?')) {
            const authService = new AuthService();
            authService.logout();
            window.location.href = '../customer/login.html';
        }
    }
}

// Inicializar la instancia cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
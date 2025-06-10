// Importación de componentes y servicios
import { SidebarManager } from './sidebar.js';
import { InventoryManager } from './inventory.js';
import { OrdersManager } from './orders.js';
import { UsersManager } from './users.js';
import { TemplateManager } from './template.js';
import { AuthService } from '../services/auth_services.js'; // Corregido nombre del archivo
import { UIService } from '../services/ui-service.js'; // Agregado servicio UI centralizado

export class AdminManager {
    constructor() {
        // Inicializar los servicios
        this.authService = new AuthService();
        this.uiService = new UIService();
        
        // Iniciar la aplicación
        this.initializeApp();
    }

    // Inicializa la aplicación de forma asíncrona
    async initializeApp() {
        try {
            // Verificar permisos antes de inicializar los componentes
            const isAdmin = await this.verificarAdmin();
            if (!isAdmin) return; // Si no es admin, detener la inicialización

            // Inicializar componentes del panel de administración
            this.templateManager = new TemplateManager();
            this.sidebarManager = new SidebarManager();
            this.productosManager = new InventoryManager();
            this.ordersManager = new OrdersManager();
            this.usersManager = new UsersManager();

            // Precargar secciones comunes para mejor rendimiento
            await this.templateManager.preloadCommonSections();

            // Configurar eventos y cargar sección inicial
            this.setupEventListeners();
            this.loadInitialSection();
        } catch (error) {
            console.error('Error al inicializar el panel admin:', error);
            this.mostrarError('Error al inicializar el panel de administración');
        }
    }

    // Verifica que el usuario actual sea administrador, consultando el token de sesión
    // Si el usuario no tiene permisos, redirige al login
    async verificarAdmin() {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser || currentUser.rol !== 'admin') {
                window.location.href = '../customer/login.html?error=unauthorized';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            window.location.href = '../customer/login.html?error=session';
            return false;
        }
    }

    // Configura los eventos globales del panel de administración
    // principalmente para la navegación entre secciones
    setupEventListeners() {
        document.addEventListener('sidebarNavigation', (e) => {
            this.cargarSeccion(e.detail.section);
        });

        // Configurar evento para manejar errores globales
        window.addEventListener('error', this.handleGlobalError.bind(this));

        // Escuchar eventos de actualización que requieren recargar secciones
        document.addEventListener('refreshSection', (e) => {
            const section = e.detail?.section;
            if (section) {
                this.refreshSection(section);
            }
        });
    }

    // Carga la sección inicial del panel
    loadInitialSection() {
        // Intentar obtener la sección de la URL
        const hash = window.location.hash.substring(1); // Elimina el #
        const initialSection = hash || 'dashboard';
        
        this.cargarSeccion(initialSection);
    }

    // Recarga una sección específica limpiando su caché
    async refreshSection(section) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        try {
            this.templateManager.showLoading(contentContainer);
            const html = await this.templateManager.refreshSection(section);
            contentContainer.innerHTML = html;
            this.initializeSectionFeatures(section);
            this.uiService.showMessage('Sección actualizada', 'success');
        } catch (error) {
            console.error('Error al recargar sección:', error);
            this.mostrarError('Error al recargar la sección');
        }
    }

    // Carga el contenido HTML de la sección seleccionada
    // e inicializa las funcionalidades específicas
    cargarSeccion(seccion) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        // Mostrar indicador de carga
        this.templateManager.showLoading(contentContainer);

        // Ocultar mensaje de bienvenida si existe
        const bienvenida = document.getElementById('bienvenida');
        if (bienvenida) {
            bienvenida.style.display = 'none';
        }

        // Actualizar URL para mantener la navegación
        window.location.hash = `#${seccion}`;

        // Cargar el contenido HTML de la sección usando el TemplateManager
        this.templateManager.loadSection(seccion)
            .then(html => {
                contentContainer.innerHTML = html;
                this.initializeSectionFeatures(seccion);
            })
            .catch(error => {
                console.error('Error al cargar sección:', error);
                this.templateManager.showError(contentContainer, 'Error al cargar la sección. Por favor intente nuevamente.');
            });
    }

    // Inicializa las funcionalidades específicas de cada sección
    // delegando la responsabilidad al manager correspondiente
    initializeSectionFeatures(seccion) {
        try {
            switch(seccion) {
                case 'inventario':
                case 'productos':
                    this.productosManager.init();
                    break;
                case 'usuarios':
                    this.usersManager.init();
                    break;
                case 'pedidos':
                    this.ordersManager.init();
                    break;
                case 'dashboard':
                    // Aquí se inicializaría un DashboardManager si existe
                    console.log('Dashboard cargado');
                    break;
                default:
                    console.warn(`Sección no reconocida: ${seccion}`);
            }
        } catch (error) {
            console.error(`Error al inicializar sección ${seccion}:`, error);
            this.mostrarError(`Error al inicializar sección ${seccion}`);
        }
    }

    // Muestra un mensaje de error en el contenedor principal
    // útil para mostrar errores críticos al usuario
    mostrarError(mensaje) {
        this.uiService.showMessage(mensaje, 'danger');
        
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="alert alert-danger m-4">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${mensaje}
                </div>
            `;
        }
    }

    // Maneja errores globales no capturados de la aplicación
    // y muestra un mensaje amigable al usuario
    handleGlobalError(e) {
        console.error('Error en la aplicación:', e.error);
        this.uiService.showMessage('Ha ocurrido un error en la aplicación', 'danger');
    }
}

// Inicializar la instancia cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
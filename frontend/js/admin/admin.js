/**
 * Módulo principal para la gestión del panel de administración
 * Este archivo coordina las diferentes secciones y componentes del panel admin
 * 
 * @module AdminManager
 * @requires SidebarManager
 * @requires InventoryManager
 * @requires OrdersManager
 * @requires UsersManager
 * @requires TemplateManager
 * @requires AuthService
 */

import { SidebarManager } from './sidebar.js';
import { InventoryManager } from './inventory.js';
import { OrdersManager } from './orders.js';
import { UsersManager } from './users.js';
import { TemplateManager } from './template.js';
import { AuthService } from '../services/auth-service.js'; // Importación añadida para gestión de autenticación

/**
 * Clase principal para gestionar el panel de administración
 * Coordina la carga de secciones y la comunicación entre componentes
 */
class AdminManager {
    /**
     * Constructor que inicializa servicios y verifica permisos de administrador
     */
    constructor() {
        this.authService = new AuthService();
        
        // Verificar permisos antes de continuar
        if (!this.verificarAdmin()) {
            return; // Detener la inicialización si no es admin
        }
        
        // Inicializar los gestores de componentes
        this.templateManager = new TemplateManager();
        this.sidebarManager = new SidebarManager();
        this.inventoryManager = new InventoryManager(); // Renombrado para consistencia
        this.ordersManager = new OrdersManager(); // Corregido a minúscula
        this.usersManager = new UsersManager();
        
        // Inicializar la aplicación
        this.init();
    }

    /**
     * Verifica si el usuario actual tiene permisos de administrador
     * Si no es admin, redirige al login
     * @returns {boolean} true si es admin, false en caso contrario
     */
    async verificarAdmin() {
        try {
            const isAdmin = await this.authService.isAdmin();
            
            if (!isAdmin) {
                console.warn('Acceso denegado: El usuario no tiene privilegios de administrador');
                window.location.href = '/pages/customer/Login.html'; // Ruta corregida con L mayúscula
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error al verificar rol de administrador:', error);
            window.location.href = '/pages/customer/Login.html';
            return false;
        }
    }

    /**
     * Inicializa la aplicación admin configurando eventos y cargando la sección inicial
     */
    init() {
        // Configurar escucha de eventos
        this.setupEventListeners();
        
        // Cargar la sección inicial
        this.loadInitialSection();
        
        console.log('Panel de administración inicializado correctamente');
    }

    /**
     * Configura los listeners de eventos para la navegación entre secciones
     */
    setupEventListeners() {
        // Escuchar evento personalizado desde la barra lateral
        document.addEventListener('sidebarNavigation', (e) => {
            this.cargarSeccion(e.detail.section);
        });
        
        // Escuchar errores globales
        window.addEventListener('error', (e) => this.handleGlobalError(e));
    }

    /**
     * Carga la sección inicial al abrir el panel
     */
    loadInitialSection() {
        // Cargar directamente la sección de inventario al iniciar
        this.cargarSeccion('inventario');
    }

    /**
     * Carga una sección específica del panel de administración
     * @param {string} seccion - Nombre de la sección a cargar ('inventario', 'usuarios', 'pedidos')
     */
    cargarSeccion(seccion) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) {
            console.error('Error: No se encontró el contenedor de contenido');
            return;
        }

        // Ocultar mensaje de bienvenida si existe
        const bienvenida = document.getElementById('bienvenida');
        if (bienvenida) {
            bienvenida.style.display = 'none';
        }

        // Mostrar indicador de carga
        contentContainer.innerHTML = `
            <div class="d-flex justify-content-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;

        // Cargar sección desde plantilla
        this.templateManager.loadSection(seccion)
            .then(html => {
                contentContainer.innerHTML = html;
                this.initializeSectionFeatures(seccion);
            })
            .catch(error => {
                console.error(`Error al cargar la sección ${seccion}:`, error);
                contentContainer.innerHTML = `
                    <div class="alert alert-danger m-4">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error al cargar la sección. Por favor intente nuevamente.
                        <button class="btn btn-outline-danger btn-sm ms-3" onclick="window.adminManager.cargarSeccion('${seccion}')">
                            <i class="fas fa-sync-alt me-1"></i> Reintentar
                        </button>
                    </div>
                `;
            });
    }

    /**
     * Muestra un mensaje de error en el contenedor principal
     * @param {string} mensaje - Mensaje de error a mostrar
     */
    mostrarError(mensaje) {
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

    /**
     * Muestra un mensaje de alerta en la interfaz
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo de alerta ('success', 'danger', 'warning', etc.)
     */
    mostrarAlerta(mensaje, tipo) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(alertDiv);
        
        // Eliminar automáticamente después de 3 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }

    /**
     * Inicializa las características específicas de cada sección
     * @param {string} seccion - Nombre de la sección a inicializar
     */
    initializeSectionFeatures(seccion) {
        switch(seccion) {
            case 'inventario':
                this.inventoryManager.init(); // Nombre corregido
                break;
            case 'usuarios':
                this.usersManager.init();
                break;
            case 'pedidos':
                this.ordersManager.init(); // Nombre corregido
                break;
            default:
                console.warn(`La sección "${seccion}" no tiene inicialización específica configurada`);
                break;
        }
    }

    /**
     * Maneja errores globales de la aplicación
     * @param {ErrorEvent} e - Evento de error
     */
    handleGlobalError(e) {
        console.error('Error en la aplicación:', e.error || e.message);
        this.mostrarAlerta('Ha ocurrido un error en la aplicación', 'danger');
    }

    /**
     * Cierra la sesión del usuario administrador
     * Utiliza el servicio de autenticación en lugar de manipular directamente localStorage
     */
    async cerrarSesion() {
        if (confirm('¿Está seguro de cerrar sesión?')) {
            try {
                await this.authService.logout();
                window.location.href = '/pages/customer/Login.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                this.mostrarAlerta('Error al cerrar sesión', 'danger');
            }
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
import { AuthService } from '../services/auth_services.js'; // Corregido nombre del archivo
import { UIService } from '../services/ui-service.js'; // Agregado servicio UI centralizado

export class SidebarManager {
    // Constructor que inicializa las propiedades y servicios necesarios
    constructor() {
        // Elemento principal del sidebar en el DOM
        this.sidebar = document.querySelector('.admin-sidebar');
        
        // Servicios necesarios
        this.authService = new AuthService();
        this.uiService = new UIService();
        
        // Inicializar el sidebar asíncronamente
        this.currentUser = null;
        this.initialize();
    }

    // Método de inicialización asíncrona
    async initialize() {
        try {
            // Obtener usuario actual
            this.currentUser = await this.authService.getCurrentUser();
            
            // Verificar permisos antes de continuar
            if (!this.verificarAdmin()) return;
            
            // Cargar contenido HTML del sidebar
            await this.loadSidebar();
            
            // Configurar eventos de navegación y logout
            this.initializeListeners();
            
            // Marcar la sección activa y actualizar perfil
            this.updateActiveSection();
            this.updateUserProfile();
        } catch (error) {
            console.error('Error inicializando sidebar:', error);
            this.uiService.showMessage('Error al cargar la barra lateral', 'danger');
        }
    }

    // Verifica que el usuario actual tenga permisos de administrador
    // Si no los tiene, redirige al login
    verificarAdmin() {
        if (!this.currentUser || this.currentUser.rol !== 'admin') {
            window.location.href = '../customer/login.html?error=unauthorized';
            return false;
        }
        return true;
    }

    // Carga el contenido HTML del sidebar desde el servidor
    async loadSidebar() {
        try {
            // Mostrar indicador de carga
            if (this.sidebar) {
                this.sidebar.innerHTML = `
                    <div class="d-flex justify-content-center p-4">
                        <div class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>`;
            }
            
            const response = await fetch('/components/admin/sidebar.html');
            if (!response.ok) {
                throw new Error(`Error cargando sidebar: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            if (this.sidebar) {
                this.sidebar.innerHTML = html;
            }
        } catch (error) {
            console.error('Error cargando sidebar:', error);
            if (this.sidebar) {
                this.sidebar.innerHTML = `
                    <div class="alert alert-danger m-3">
                        Error al cargar la barra lateral. 
                        <button class="btn btn-danger btn-sm mt-2" onclick="location.reload()">
                            Reintentar
                        </button>
                    </div>`;
            }
        }
    }

    // Configura los eventos de navegación y cierre de sesión
    initializeListeners() {
        if (!this.sidebar) return;

        // Usar delegación de eventos para todos los enlaces del menú
        this.sidebar.addEventListener('click', (e) => {
            // Para navegación entre secciones
            const navLink = e.target.closest('.nav-link[data-section]');
            if (navLink) {
                e.preventDefault();
                this.handleNavigation(navLink);
            }
            
            // Para cierre de sesión
            const logoutBtn = e.target.closest('.text-danger');
            if (logoutBtn) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    // Maneja la navegación entre secciones del panel
    handleNavigation(linkElement) {
        const section = linkElement.dataset.section;
        
        // Actualizar clase activa en el menú
        this.sidebar.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');

        // Disparar evento personalizado para que AdminManager maneje el cambio de sección
        const event = new CustomEvent('sidebarNavigation', {
            detail: { section }
        });
        document.dispatchEvent(event);
    }

    // Actualiza la sección activa basada en la URL o sección por defecto
    updateActiveSection() {
        if (!this.sidebar) return;
        
        const currentSection = window.location.hash.slice(1) || 'dashboard';
        const activeLink = this.sidebar.querySelector(`[data-section="${currentSection}"]`);
        
        if (activeLink) {
            this.sidebar.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            activeLink.classList.add('active');
        }
    }

    // Actualiza la información del perfil en el sidebar
    updateUserProfile() {
        if (!this.currentUser || !this.sidebar) return;

        const userImage = this.sidebar.querySelector('.profile-image');
        const userName = this.sidebar.querySelector('.admin-name');

        if (userImage) {
            userImage.src = this.currentUser.profileImage || '/assets/images/avatar-default.png';
            userImage.alt = this.currentUser.nombre || 'Administrador';
        }
        
        if (userName) {
            userName.textContent = this.currentUser.nombre || this.currentUser.email || 'Administrador';
        }
    }

    // Maneja el cierre de sesión con confirmación
    handleLogout() {
        // Usar UIService para el modal de confirmación
        this.uiService.createModal({
            id: 'confirmLogoutModal',
            title: 'Cerrar sesión',
            content: '¿Está seguro que desea cerrar sesión? Perderá los cambios no guardados.',
            buttons: [
                {
                    text: 'Cancelar',
                    class: 'btn-secondary',
                    close: true
                },
                {
                    text: 'Cerrar Sesión',
                    class: 'btn-danger',
                    callback: () => {
                        // Usar el servicio de autenticación para cerrar sesión
                        this.authService.logout();
                        // Redireccionar al login
                        window.location.href = '../customer/login.html';
                    }
                }
            ]
        }).show();
    }
}
import { AuthService } from '../services/auth-service.js'; // Servicio de autenticación
import { UIService } from '../services/ui-service.js'; // Servicio de interfaz de usuario

/**
 * Clase que gestiona la barra lateral del panel de administración
 * Maneja la navegación, selección de secciones y perfil de usuario
 */
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

    /**
     * Método de inicialización asíncrona
     * Carga usuario, verifica permisos y configura el sidebar
     */
    async initialize() {
        try {
            // Obtener datos del usuario actual desde el servicio de autenticación
            this.currentUser = await this.authService.getCurrentUser();
            
            // Verificar permisos antes de continuar
            if (!this.verificarAdmin()) return;
            
            // Cargar el HTML del sidebar desde el servidor
            await this.loadSidebar();
            
            // Configurar eventos para navegación y cierre de sesión
            this.initializeListeners();
            
            // Marcar la sección activa y actualizar información del perfil
            this.updateActiveSection();
            this.updateUserProfile();
        } catch (error) {
            console.error('Error al inicializar sidebar:', error);
            this.uiService.showMessage('Error al cargar la barra lateral', 'danger');
        }
    }

    /**
     * Verifica que el usuario tenga permisos de administrador
     * Redirige al login si no tiene los permisos necesarios
     * @returns {boolean} - true si es admin, false si no lo es
     */
    verificarAdmin() {
        // Comprobar rol de administrador (admite varios formatos de rol)
        if (!this.currentUser || 
           (this.currentUser.rol !== 'admin' && 
            this.currentUser.rol !== 'ROLE_ADMIN' && 
            this.currentUser.role !== 'admin' && 
            this.currentUser.role !== 'ROLE_ADMIN')) {
            
            // Redirigir al login con mensaje de error
            window.location.href = '/pages/customer/Login.html?error=unauthorized';
            return false;
        }
        return true;
    }

    /**
     * Carga el contenido HTML del sidebar desde el servidor
     * Muestra un spinner mientras carga y maneja errores
     */
    async loadSidebar() {
        try {
            // Mostrar indicador de carga mientras se obtiene el contenido
            if (this.sidebar) {
                this.sidebar.innerHTML = `
                    <div class="d-flex justify-content-center p-4">
                        <div class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>`;
            }
            
            // Intentar cargar primero desde ruta relativa
            let response;
            try {
                response = await fetch('/components/admin/sidebar.html');
                if (!response.ok) throw new Error('No se encontró en la ruta principal');
            } catch (e) {
                // Si falla, intentar con ruta alternativa
                response = await fetch('./components/admin/sidebar.html');
                if (!response.ok) {
                    throw new Error(`Error cargando sidebar: ${response.status} ${response.statusText}`);
                }
            }

            const html = await response.text();
            if (this.sidebar) {
                this.sidebar.innerHTML = html;
            }
        } catch (error) {
            console.error('Error cargando sidebar:', error);
            if (this.sidebar) {
                // Mostrar mensaje de error con botón para reintentar
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

    /**
     * Configura los eventos de navegación y cierre de sesión
     * Usa delegación de eventos para mayor eficiencia
     */
    initializeListeners() {
        if (!this.sidebar) return;

        // Usar delegación de eventos para todos los enlaces del menú
        this.sidebar.addEventListener('click', (e) => {
            // Para navegación entre secciones del panel
            const navLink = e.target.closest('.nav-link[data-section]');
            if (navLink) {
                e.preventDefault();
                this.handleNavigation(navLink);
            }
            
            // Para el botón de cierre de sesión
            const logoutBtn = e.target.closest('.text-danger');
            if (logoutBtn) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    /**
     * Maneja el cambio de sección al hacer clic en un enlace
     * @param {HTMLElement} linkElement - El elemento enlace que se ha clicado
     */
    handleNavigation(linkElement) {
        const section = linkElement.dataset.section;
        
        // Actualizar clase activa en el menú (visual)
        this.sidebar.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');

        // Disparar evento personalizado para que AdminManager cargue la sección
        const event = new CustomEvent('sidebarNavigation', {
            detail: { section }
        });
        document.dispatchEvent(event);
    }

    /**
     * Marca como activa la sección actual según la URL o usa la predeterminada
     * Útil al recargar la página o entrar directamente con un hash
     */
    updateActiveSection() {
        if (!this.sidebar) return;
        
        // Obtener sección de la URL o usar 'dashboard' por defecto
        const currentSection = window.location.hash.slice(1) || 'dashboard';
        const activeLink = this.sidebar.querySelector(`[data-section="${currentSection}"]`);
        
        // Si existe el enlace correspondiente, marcarlo como activo
        if (activeLink) {
            this.sidebar.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            activeLink.classList.add('active');
        }
    }

    /**
     * Actualiza la información del perfil del usuario en el sidebar
     * Muestra nombre, correo e imagen del administrador actual
     */
    updateUserProfile() {
        if (!this.currentUser || !this.sidebar) return;

        const userImage = this.sidebar.querySelector('.profile-image');
        const userName = this.sidebar.querySelector('.admin-name');

        // Actualizar imagen de perfil (usar imagen por defecto si no tiene)
        if (userImage) {
            userImage.src = this.currentUser.profileImage || '/assets/images/avatar-default.png';
            userImage.alt = this.currentUser.nombre || 'Administrador';
        }
        
        // Actualizar nombre (usar email si no tiene nombre, o "Administrador" como último recurso)
        if (userName) {
            userName.textContent = this.currentUser.nombre || this.currentUser.email || 'Administrador';
        }
    }

    /**
     * Muestra un modal de confirmación antes de cerrar la sesión
     * Usa UIService para crear el modal de manera consistente
     */
    handleLogout() {
        // Crear modal de confirmación con opciones para cancelar o confirmar
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
                        // Usar el servicio de autenticación para cerrar sesión correctamente
                        this.authService.logout();
                        // Redireccionar al login con L mayúscula para mantener consistencia
                        window.location.href = '/pages/customer/Login.html';
                    }
                }
            ]
        }).show();
    }
}
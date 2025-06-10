import { AuthService } from '../services/auth-service.js';

export class SidebarManager {
    // Constructor que inicializa las propiedades y servicios necesarios
    constructor() {
        // Elemento principal del sidebar en el DOM
        this.sidebar = document.querySelector('.admin-sidebar');
        
        // Servicio de autenticación para manejar sesiones
        this.authService = new AuthService();
        
        // Usuario actual obtenido a través del servicio
        this.currentUser = this.authService.getCurrentUser();
        
        // Inicializar el sidebar
        this.init();
    }

    // Verifica que el usuario actual tenga permisos de administrador
    // Si no los tiene, redirige al login
    verificarAdmin() {
        if (!this.currentUser || this.currentUser.rol !== 'admin') {
            window.location.href = '../customer/login.html';
            return false;
        }
        return true;
    }

    // Inicializa el sidebar cargando el contenido y configurando eventos
    async init() {
        try {
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
        }
    }

    // Carga el contenido HTML del sidebar desde el servidor
    async loadSidebar() {
        try {
            const response = await fetch('/components/admin/sidebar.html');
            if (!response.ok) {
                throw new Error(`Error cargando sidebar: ${response.status}`);
            }
            const html = await response.text();
            if (this.sidebar) {
                this.sidebar.innerHTML = html;
            }
        } catch (error) {
            console.error('Error cargando sidebar:', error);
        }
    }

    // Configura los eventos de navegación y cierre de sesión
    initializeListeners() {
        if (!this.sidebar) return;

        // Agregar eventos de navegación a los enlaces del menú
        this.sidebar.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.currentTarget);
            });
        });

        // Agregar evento de cierre de sesión
        const logoutButton = this.sidebar.querySelector('.text-danger');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
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
        const currentSection = window.location.hash.slice(1) || 'dashboard';
        const activeLink = this.sidebar.querySelector(`[data-section="${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Actualiza la información del perfil en el sidebar
    updateUserProfile() {
        if (!this.currentUser) return;

        const userImage = this.sidebar.querySelector('.profile-image');
        const userName = this.sidebar.querySelector('.admin-name');

        if (userImage && this.currentUser.profileImage) {
            userImage.src = this.currentUser.profileImage;
        }
        if (userName && this.currentUser.name) {
            userName.textContent = this.currentUser.name;
        }
    }

    // Maneja el cierre de sesión con confirmación
    handleLogout() {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            // Usar el servicio de autenticación para cerrar sesión
            this.authService.logout();
            // Redireccionar al login
            window.location.href = '../customer/login.html';
        }
    }
}
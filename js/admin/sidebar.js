export class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.admin-sidebar');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.verificarAdmin(); // Mover verificación aquí
        this.init();
    }

    verificarAdmin() {
        if (!this.currentUser || this.currentUser.rol !== 'admin') {
            window.location.href = '/pages/customer/Login.html';
            return false;
        }
        return true;
    }

    async init() {
        try {
            await this.loadSidebar();
            this.initializeListeners();
            this.updateActiveSection();
            this.updateUserProfile();
        } catch (error) {
            console.error('Error initializing sidebar:', error);
        }
    }

    async loadSidebar() {
        try {
            const response = await fetch('/components/admin/sidebar.html');
            const html = await response.text();
            if (this.sidebar) {
                this.sidebar.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    initializeListeners() {
        if (!this.sidebar) return;

        this.sidebar.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.currentTarget);
            });
        });

        const logoutButton = this.sidebar.querySelector('.text-danger');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    handleNavigation(linkElement) {
        const section = linkElement.dataset.section;
        
        // Actualizar clase activa
        this.sidebar.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');

        // Disparar evento de navegación
        const event = new CustomEvent('sidebarNavigation', {
            detail: { section }
        });
        document.dispatchEvent(event);
    }

    loadSection(section) {
        const contentContainer = document.getElementById('content-container');
        
        // Mostrar indicador de carga
        contentContainer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;

        // Cargar el contenido de la sección
        fetch(`/pages/admin/sections/${section}.html`)
            .then(response => response.text())
            .then(html => {
                contentContainer.innerHTML = html;
                this.initializeSectionFeatures(section);
            })
            .catch(error => {
                console.error('Error loading section:', error);
                contentContainer.innerHTML = `
                    <div class="alert alert-danger m-4">
                        Error al cargar la sección. Por favor intente nuevamente.
                    </div>
                `;
            });
    }

    initializeSectionFeatures(section) {
        switch(section) {
            case 'inventario':
                // Inicializar funcionalidades de inventario
                window.adminManager?.productosManager?.init();
                break;
            case 'pedidos':
                // Inicializar funcionalidades de pedidos
                this.initPedidosFeatures();
                break;
            case 'usuarios':
                // Inicializar funcionalidades de usuarios
                this.initUsuariosFeatures();
                break;
        }
    }

    updateActiveSection() {
        const currentSection = window.location.hash.slice(1) || 'dashboard';
        const activeLink = this.sidebar.querySelector(`[data-section="${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

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

    handleLogout() {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/customer/login.html';
        }
    }
}
// Importación de servicios necesarios
import { AuthService } from '../services/auth-service.js';
import { CustomerCartService } from '../services/customer/cart_services.js';
import { UIService } from '../services/ui-service.js';

/**
 * Clase para gestionar componentes UI reutilizables
 */
export class ComponentsManager {
    // Método para inicializar animaciones en tarjetas del equipo
    static initializeAnimations() {
        const tarjetas = document.querySelectorAll('.equipo-card');
        tarjetas.forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('rotar'));
            card.addEventListener('mouseleave', () => card.classList.remove('rotar'));
        });
    }

    // Método para crear el HTML de una tarjeta de producto
    static createProductCard(producto) {
        if (!producto) return '';
        
        return `
            <div class="col">
                <div class="card h-100">
                    <img src="${producto.imagen || '/assets/images/placeholder.png'}" 
                         class="card-img-top producto-img" 
                         alt="${producto.nombre}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre || 'Sin nombre'}</h5>
                        <p class="card-text">${producto.descripcion || 'Sin descripción'}</p>
                        <p class="card-text">
                            <small class="text-muted">Stock: ${producto.stock || 0} unidades</small>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${(producto.precio || 0).toLocaleString()}</span>
                            <button class="btn btn-primary btn-agregar-carrito" data-id="${producto.id || producto.idProducto}">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Método para cargar todos los componentes comunes
    static async loadComponents() {
        try {
            await Promise.all([
                this.loadNavbar(),
                this.loadFooter()
            ]);
            this.initializeNavbarFeatures();
        } catch (error) {
            console.error('Error loading components:', error);
            this.showMessage('Error al cargar los componentes de la página', 'danger');
        }
    }

    // Método para cargar la barra de navegación
    static async loadNavbar() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (!navPlaceholder) return;

        try {
            const response = await fetch('/components/navbar.html');
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            
            const html = await response.text();
            navPlaceholder.innerHTML = html;
            
            // Agregar el contador al icono del carrito
            const cartIcon = navPlaceholder.querySelector('.nav-icon i.fa-shopping-cart');
            if (cartIcon) {
                const cartContainer = cartIcon.parentElement;
                const counter = document.createElement('span');
                counter.className = 'cart-counter';
                cartContainer.appendChild(counter);
            }
            
            // Actualizar contador
            await this.updateCartCounter();
            
            // Verificar si hay un usuario logueado y actualizar la UI
            await this.updateUserUI();
            
            // Inicializar la búsqueda
            this.initializeSearch();
        } catch (error) {
            console.error('Error loading navbar:', error);
            navPlaceholder.innerHTML = `
                <nav class="navbar navbar-dark bg-dark">
                    <div class="container">
                        <span class="navbar-brand">Error al cargar la navegación</span>
                    </div>
                </nav>
            `;
        }
    }

    // Método para cargar el pie de página
    static async loadFooter() {
        const footerPlaceholder = document.getElementById('footer-content');
        if (!footerPlaceholder) return;

        try {
            const response = await fetch('/components/footer.html');
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            
            const footerHtml = await response.text();
            footerPlaceholder.innerHTML = footerHtml;

            // Actualizar dinámicamente el año actual
            const yearSpan = footerPlaceholder.querySelector('.current-year');
            if (yearSpan) {
                yearSpan.textContent = new Date().getFullYear();
            }
        } catch (error) {
            console.error('Error loading footer:', error);
            footerPlaceholder.innerHTML = `
                <footer class="bg-dark text-white py-3">
                    <div class="container text-center">
                        <small>© ${new Date().getFullYear()} ConSentido.Co - Error al cargar el pie de página</small>
                    </div>
                </footer>
            `;
        }
    }

    // Método para inicializar funcionalidades de la barra de navegación
    static initializeNavbarFeatures() {
        try {
            // Inicializar dropdowns de Bootstrap
            const dropdowns = document.querySelectorAll('.dropdown-toggle');
            if (typeof bootstrap !== 'undefined') {
                dropdowns.forEach(dropdown => {
                    new bootstrap.Dropdown(dropdown);
                });
            }

            // Manejar el toggle del menú en móvil
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarContent = document.querySelector('#navbarContent');
            if (navbarToggler && navbarContent) {
                navbarToggler.addEventListener('click', () => {
                    navbarContent.classList.toggle('show');
                });
            }
        } catch (error) {
            console.error('Error initializing navbar features:', error);
        }
    }

    // Método para actualizar la UI según el estado de la sesión
    static async updateUserUI() {
        const userIcon = document.querySelector('.nav-icon i.fa-user, .nav-icon i.fa-user-check');
        if (!userIcon) return;
        
        try {
            // Usar el servicio de autenticación
            const authService = new AuthService();
            const currentUser = await authService.getCurrentUser();
            
            if (currentUser) {
                if (currentUser.rol === 'admin' || currentUser.rol === 'ROLE_ADMIN') {
                    userIcon.classList.remove('fa-user');
                    userIcon.classList.remove('fa-user-check');
                    userIcon.classList.add('fa-user-shield');
                    userIcon.parentElement.href = '/pages/admin/index.html';
                } else {
                    userIcon.classList.remove('fa-user');
                    userIcon.classList.remove('fa-user-shield');
                    userIcon.classList.add('fa-user-check');
                    userIcon.parentElement.href = '/pages/customer/profile.html';
                }
            } else {
                userIcon.classList.remove('fa-user-check');
                userIcon.classList.remove('fa-user-shield');
                userIcon.classList.add('fa-user');
                userIcon.parentElement.href = '/pages/customer/Login.html';
            }
        } catch (error) {
            console.error('Error updating user UI:', error);
            // Fallback a no autenticado
            userIcon.classList.remove('fa-user-check');
            userIcon.classList.remove('fa-user-shield');
            userIcon.classList.add('fa-user');
            userIcon.parentElement.href = '/pages/customer/Login.html';
        }
    }

    // Método para actualizar el contador del carrito
    static async updateCartCounter() {
        const counter = document.querySelector('.cart-counter');
        if (!counter) return;

        try {
            // Usar servicios en lugar de acceder directamente a localStorage
            const authService = new AuthService();
            const cartService = new CustomerCartService();
            
            // Obtener usuario actual a través del servicio
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                counter.style.display = 'none';
                return;
            }

            // Obtener carrito a través del servicio
            const carrito = await cartService.getCart();
            
            if (!Array.isArray(carrito)) {
                counter.style.display = 'none';
                return;
            }
            
            const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);

            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        } catch (error) {
            console.error('Error actualizando contador del carrito:', error);
            counter.style.display = 'none';
        }
    }

    // Método para agregar un producto al carrito
    static async addToCart(productId, quantity = 1) {
        try {
            if (!productId) {
                throw new Error('ID de producto no válido');
            }

            // Usar servicio de autenticación para verificar usuario
            const authService = new AuthService();
            const currentUser = await authService.getCurrentUser();
            
            if (!currentUser) {
                const currentPage = encodeURIComponent(window.location.href);
                window.location.href = `/pages/customer/Login.html?redirect=${currentPage}`;
                return;
            }

            // Usar servicio del carrito para agregar producto
            const cartService = new CustomerCartService();
            await cartService.addToCart({
                producto_id: productId,
                cantidad: quantity
            });
            
            // Actualizar contador del carrito
            await this.updateCartCounter();
            
            // Mostrar mensaje de éxito usando UIService
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            this.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    // Método para mostrar mensajes de alerta usando UIService
    static showMessage(message, type) {
        try {
            const uiService = new UIService();
            uiService.showMessage(message, type);
        } catch (error) {
            console.error('Error showing message:', error);
            // Fallback para mostrar alerta si falla el servicio
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Método para inicializar la búsqueda
    static initializeSearch() {
        const searchInput = document.querySelector('.search-box input');
        const searchButton = document.querySelector('.search-box button');

        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/pages/customer/search.html?q=${encodeURIComponent(query)}`;
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = `/pages/customer/search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }
}

// Initialize components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ComponentsManager.loadComponents();
    
    // Configurar delegación de eventos para botones de agregar al carrito
    document.addEventListener('click', (e) => {
        const addButton = e.target.closest('.btn-agregar-carrito');
        if (addButton) {
            e.preventDefault();
            const productId = addButton.dataset.id;
            ComponentsManager.addToCart(productId, 1);
        }
    });
});

/**
 * Clase para gestionar modales, utilizando UIService
 */
export class ModalManager {
    static initModal(options = {}) {
        try {
            const uiService = new UIService();
            
            // Busca un modal existente o crea uno nuevo
            const modalId = options.id || 'app-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                return {
                    show: (content, title) => uiService.createModal({
                        id: modalId,
                        title: title || options.title || 'Mensaje',
                        content: content || options.content || '',
                        size: options.size || 'modal-md'
                    }).show(),
                    hide: () => {
                        const modalElement = document.getElementById(modalId);
                        if (modalElement && typeof bootstrap !== 'undefined') {
                            const bsModal = bootstrap.Modal.getInstance(modalElement);
                            if (bsModal) bsModal.hide();
                        }
                    }
                };
            }
            
            // Si el modal ya existe, retorna funciones para controlarlo
            if (typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                return {
                    show: () => bsModal.show(),
                    hide: () => bsModal.hide()
                };
            } else {
                return {
                    show: () => modal.style.display = 'block',
                    hide: () => modal.style.display = 'none'
                };
            }
        } catch (error) {
            console.error('Error initializing modal:', error);
            return {
                show: () => alert('Error al mostrar el modal'),
                hide: () => {}
            };
        }
    }
}
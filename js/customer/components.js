// Importación de servicios necesarios
import { AuthService } from '../services/auth-service.js';
import { CustomerCartService } from '../services/customer/cart_services.js';

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
        return `
            <div class="col">
                <div class="card h-100">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">${producto.descripcion}</p>
                        <p class="card-text">
                            <small class="text-muted">Stock: ${producto.stock} unidades</small>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${producto.precio.toLocaleString()}</span>
                            <button class="btn btn-primary btn-agregar-carrito" data-id="${producto.id}">
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
            await this.loadNavbar();
            await this.loadFooter();
            this.initializeNavbarFeatures();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    // Método para cargar la barra de navegación
    static async loadNavbar() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (!navPlaceholder) return;

        try {
            const response = await fetch('/components/navbar.html');
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
            this.updateCartCounter();
            
            // Verificar si hay un usuario logueado y actualizar la UI
            this.updateUserUI();
            
            // Inicializar la búsqueda
            this.initializeSearch();
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    // Método para cargar el pie de página
    static async loadFooter() {
        const footerPlaceholder = document.getElementById('footer-content');
        if (!footerPlaceholder) return;

        try {
            const response = await fetch('/components/footer.html');
            const footerHtml = await response.text();
            footerPlaceholder.innerHTML = footerHtml;

            // Actualizar dinámicamente el año actual
            const yearSpan = footerPlaceholder.querySelector('.current-year');
            if (yearSpan) {
                yearSpan.textContent = new Date().getFullYear();
            }

        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Método para inicializar funcionalidades de la barra de navegación
    static initializeNavbarFeatures() {
        // Inicializar dropdowns de Bootstrap
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(dropdown => {
            new bootstrap.Dropdown(dropdown);
        });

        // Manejar el toggle del menú en móvil
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarContent = document.querySelector('#navbarContent');
        if (navbarToggler && navbarContent) {
            navbarToggler.addEventListener('click', () => {
                navbarContent.classList.toggle('show');
            });
        }
    }

    // Método para actualizar la UI según el estado de la sesión
    static async updateUserUI() {
        const userIcon = document.querySelector('.nav-icon i.fa-user');
        if (!userIcon) return;
        
        // Usar el servicio de autenticación en lugar de localStorage
        const authService = new AuthService();
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser && currentUser.rol !== 'admin') {
            userIcon.classList.remove('fa-user');
            userIcon.classList.add('fa-user-check');
            userIcon.parentElement.href = '/pages/customer/profile.html';
        } else {
            userIcon.classList.remove('fa-user-check');
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
            const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

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
            // Usar servicio de autenticación para verificar usuario
            const authService = new AuthService();
            const currentUser = await authService.getCurrentUser();
            
            if (!currentUser) {
                window.location.href = '/pages/customer/Login.html?redirect=cart';
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
            
            // Mostrar mensaje de éxito
            this.showMessage('Producto agregado al carrito', 'success');
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            this.showMessage('Error al agregar el producto al carrito', 'danger');
        }
    }

    // Método para mostrar mensajes de alerta
    static showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
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

export class ModalManager {
    static initModal() {
        const modal = document.getElementById('modal-success');
        const modalClose = document.getElementById('modal-close');

        modalClose?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        return {
            show: () => modal.style.display = 'flex',
            hide: () => modal.style.display = 'none'
        };
    }
}
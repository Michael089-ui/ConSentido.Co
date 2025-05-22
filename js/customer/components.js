export class ComponentsManager {
    static initializeAnimations() {
        const tarjetas = document.querySelectorAll('.equipo-card');
        tarjetas.forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('rotar'));
            card.addEventListener('mouseleave', () => card.classList.remove('rotar'));
        });
    }

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
                            <button class="btn btn-primary" onclick="productosVista.agregarAlCarrito(${producto.id})">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static async loadComponents() {
        try {
            await this.loadNavbar();
            await this.loadFooter();
            this.initializeNavbarFeatures();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    static async loadNavbar() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (!navPlaceholder) return;

        try {
            const response = await fetch('/components/navbar.html');
            const html = await response.text();
            navPlaceholder.innerHTML = html;
            
            // Verificar si hay un usuario logueado y actualizar la UI
            this.updateUserUI();
            
            // Inicializar el contador del carrito
            this.updateCartCounter();
            
            // Inicializar la búsqueda
            this.initializeSearch();
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    static async loadFooter() {
    const footerPlaceholder = document.getElementById('footer-content');
    if (!footerPlaceholder) return;

    try {
        const response = await fetch('/components/footer.html');
        const footerHtml = await response.text();
        footerPlaceholder.innerHTML = footerHtml;

        //para actaulizar dinámicamente el año de
        const yearSpan = footerPlaceholder.querySelector('.current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

    } catch (error) {
        console.error('Error loading footer:', error);
    }
}


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

    static updateUserUI() {
        const userIcon = document.querySelector('.nav-icon i.fa-user');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser && userIcon) {
            userIcon.classList.remove('fa-user');
            userIcon.classList.add('fa-user-check');
            userIcon.parentElement.href = '/pages/customer/profile.html';
        }
    }

    static updateCartCounter() {
        const cartBadge = document.querySelector('.badge');
        if (cartBadge) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartBadge.textContent = cart.length;
        }
    }

    static initializeSearch() {
        const searchInput = document.querySelector('.search-box input');
        const searchButton = document.querySelector('.search-box button');

        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => this.handleSearch(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }
    }

    static handleSearch(query) {
        if (query.trim()) {
            window.location.href = `/pages/customer/search.html?q=${encodeURIComponent(query)}`;
        }
    }
}

// Initialize components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ComponentsManager.loadComponents();
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
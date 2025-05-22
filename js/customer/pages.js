import { ComponentsManager, ModalManager } from './components.js';

export class ProductosVista {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.categoria = document.body.dataset.categoria;
        this.modal = ModalManager.initModal();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.mostrarProductos();
        });
    }

    mostrarProductos() {
        const contenedor = document.getElementById('productos-container');
        if (!contenedor) return;

        const productosFiltrados = this.productos.filter(producto => 
            producto.categoria.toLowerCase() === this.categoria.toLowerCase()
        );

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    No hay productos disponibles en esta categoría.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = `
            <div class="row row-cols-1 row-cols-md-3 g-4">
                ${productosFiltrados.map(producto => 
                    ComponentsManager.createProductCard(producto)
                ).join('')}
            </div>
        `;
    }

    agregarAlCarrito(id) {
        // Implementar función de agregar al carrito
        alert('Función de carrito en desarrollo');
    }
}

export class ContactPage {
    constructor() {
        this.checkbox = document.getElementById('Vende');
        this.formSuperior = document.querySelector('.form-superior');
        this.formInferior = document.querySelector('.form-inferior');
        this.modal = ModalManager.initModal();
        this.init();
    }

    init() {
        this.initializeFormToggle();
        this.initializeFormSubmissions();
        document.body.classList.add('fondo-urgente');
    }

    initializeFormToggle() {
        this.checkbox?.addEventListener('change', () => {
            if (this.checkbox.checked) {
                this.formSuperior.style.display = 'none';
                this.formInferior.style.display = 'block';
            } else {
                this.formSuperior.style.display = 'block';
                this.formInferior.style.display = 'none';
            }
            
            document.body.classList.remove('fondo-urgente');
            document.body.classList.add('fondo-claro');
        });
    }

    initializeFormSubmissions() {
        this.formSuperior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formSuperior));
        this.formInferior?.addEventListener('submit', (e) => this.handleSubmit(e, this.formInferior));
    }

    async handleSubmit(e, form) {
        e.preventDefault();
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                form.reset();
                this.modal.show();
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            alert('Error al enviar el formulario');
        }
    }
}
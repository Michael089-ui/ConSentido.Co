export class UsuariosManager {
    constructor() {
        this.usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    }

    init() {
        this.loadUsuarios();
        this.initializeFilters();
    }

    loadUsuarios() {
        const tablaUsuarios = document.getElementById('tablaUsuarios');
        if (!tablaUsuarios) return;

        // Cargar y mostrar usuarios
        // ...implementation
    }
}
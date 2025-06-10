// Importación del servicio para manejo de usuarios desde el archivo correcto
import { UserServices } from '../services/admin/manage_users_services.js';

export class UsersManager {
    // Constructor que inicializa la instancia del servicio y el arreglo de usuarios
    constructor() {
        this.userService = new UserServices();
        this.users = [];
    }

    // Método para inicializar la carga de usuarios y configurar eventos
    async init() {
        console.log('Inicializando UsersManager...');
        await this.loadUsers();
        this.setupEventListeners();
    }

    // Método para cargar la lista de usuarios desde el backend
    async loadUsers() {
        try {
            console.log('Cargando usuarios...');
            const users = await this.userService.getAllUser();
            console.log('Usuarios cargados:', users);

            // Validar que la respuesta sea un arreglo
            if (!Array.isArray(users)) {
                console.error('Se esperaba un arreglo de usuarios pero se recibió:', typeof users);
                this.showMessage('Error al cargar usuarios', 'danger');
                return;
            }

            // Guardar usuarios y renderizarlos en la tabla
            this.users = users;
            this.renderUsers(users);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.showMessage('Error al cargar usuarios', 'danger');
        }
    }

    // Método para renderizar la tabla de usuarios en el DOM
    renderUsers(users) {
        console.log('Renderizando usuarios:', users);
        const tableBody = document.getElementById('tablaUsuarios');
        if (!tableBody) {
            console.error('Elemento tbody con id "tablaUsuarios" no encontrado');
            return;
        }

        // Generar el HTML para cada fila de usuario y asignarlo al tbody
        const html = users.map(user => this.createUserRow(user)).join('');
        console.log('HTML generado para usuarios:', html);
        tableBody.innerHTML = html;

        // Inicializar eventos para los botones de cada fila
        this.initializeButtons();
    }

    // Método para crear el HTML de una fila de usuario
    createUserRow(user) {
        return `
            <tr>
                <td>${user.name || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.rol || 'cliente'}</td>
                <td>
                    <span class="badge bg-${user.estado === 'activo' ? 'success' : 'danger'}">
                        ${user.estado || 'inactivo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info view-user" data-id="${user.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-user" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Método para asignar eventos a los botones de ver, editar y eliminar usuario
    initializeButtons() {
        document.querySelectorAll('.view-user').forEach(btn => {
            btn.addEventListener('click', () => this.viewUser(btn.dataset.id));
        });

        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => this.editUser(btn.dataset.id));
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => this.deleteUser(btn.dataset.id));
        });
    }

    // Método para mostrar los detalles de un usuario en un modal
    async viewUser(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        const modalContent = `
            <div class="row">
                <div class="col-12">
                    <h4>Detalles del Usuario</h4>
                    <hr>
                    <p><strong>Nombre:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Rol:</strong> ${user.rol}</p>
                    <p><strong>Estado:</strong> ${user.estado}</p>
                    <p><strong>Tipo Documento:</strong> ${user.tipoDoc || 'No especificado'}</p>
                    <p><strong>Número Documento:</strong> ${user.numeroDoc || 'No especificado'}</p>
                    <p><strong>Celular:</strong> ${user.celular || 'No especificado'}</p>
                </div>
            </div>
        `;

        // Mostrar modal con la información del usuario
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        document.getElementById('userModalBody').innerHTML = modalContent;
        modal.show();
    }

    // Método para mostrar el formulario de edición de usuario en un modal
    async editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        const modalContent = `
            <form id="editUserForm">
                <input type="hidden" id="userId" value="${user.id}">
                <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="editName" value="${user.name}" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="editEmail" value="${user.email}" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Rol</label>
                    <select class="form-select" id="editRol">
                        <option value="cliente" ${user.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                        <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" id="editEstado">
                        <option value="activo" ${user.estado === 'activo' ? 'selected' : ''}>Activo</option>
                        <option value="inactivo" ${user.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
            </form>
        `;

        // Mostrar modal con formulario de edición
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        document.getElementById('editUserModalBody').innerHTML = modalContent;

        // Asignar evento para manejar el envío del formulario
        document.getElementById('editUserForm').addEventListener('submit', (e) => this.handleEditUser(e));

        modal.show();
    }

    // Método para manejar el envío del formulario de edición y actualizar el usuario
    async handleEditUser(e) {
        e.preventDefault();

        // Recopilar datos del formulario
        const userData = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            rol: document.getElementById('editRol').value,
            estado: document.getElementById('editEstado').value
        };

        const userId = document.getElementById('userId').value;

        try {
            // Actualizar usuario en backend
            await this.userService.updateUser(userId, userData);
            // Recargar lista de usuarios
            await this.loadUsers();

            // Cerrar modal de edición
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();

            this.showMessage('Usuario actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            this.showMessage('Error al actualizar usuario', 'danger');
        }
    }

    // Método para eliminar un usuario tras confirmación
    async deleteUser(id) {
        if (confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                // Eliminar usuario en backend
                await this.userService.deleteUser(id);
                // Recargar lista de usuarios
                await this.loadUsers();
                this.showMessage('Usuario eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                this.showMessage('Error al eliminar usuario', 'danger');
            }
        }
    }

    // Método para mostrar mensajes de alerta en la interfaz
    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.querySelector('.content');
        if (container) {
            container.prepend(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Método para configurar eventos globales si es necesario
    setupEventListeners() {
        // agregar aquí
    }
}
import { UserService } from '../services/user_services.js';

export class UsersManager {
    constructor() {
        this.userService = new UserService();
        this.users = [];
    }

    async init() {
        console.log('Inicializando UsersManager...');
        await this.loadUsers();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            console.log('Loading users...');
            const users = await this.userService.getAllUsers();
            console.log('Loaded users:', users);
            
            if (!Array.isArray(users)) {
                console.error('Expected array of users but got:', typeof users);
                return;
            }

            this.users = users;
            this.renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Error al cargar usuarios', 'danger');
        }
    }

    renderUsers(users) {
        console.log('Rendering users:', users);
        const tableBody = document.getElementById('tablaUsuarios');
        if (!tableBody) {
            console.error('Table body element not found');
            return;
        }

        const html = users.map(user => this.createUserRow(user)).join('');
        console.log('Generated HTML:', html);
        tableBody.innerHTML = html;
        this.initializeButtons();
    }

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

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        document.getElementById('userModalBody').innerHTML = modalContent;
        modal.show();
    }

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

        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        document.getElementById('editUserModalBody').innerHTML = modalContent;
        
        // Manejar el envío del formulario
        document.getElementById('editUserForm').addEventListener('submit', (e) => this.handleEditUser(e));
        
        modal.show();
    }

    async handleEditUser(e) {
        e.preventDefault();
        
        const userData = {
            id: document.getElementById('userId').value,
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            rol: document.getElementById('editRol').value,
            estado: document.getElementById('editEstado').value
        };

        try {
            await this.userService.updateUser(userData.id, userData);
            await this.loadUsers();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            
            this.showMessage('Usuario actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al actualizar usuario', 'danger');
        }
    }

    async deleteUser(id) {
        if (confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                await this.userService.deleteUser(id);
                await this.loadUsers();
                this.showMessage('Usuario eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error:', error);
                this.showMessage('Error al eliminar usuario', 'danger');
            }
        }
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.content').prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}
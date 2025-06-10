// Importación del servicio para manejo de usuarios desde el archivo correcto
import { UserServices } from '../services/admin/manage_user_services.js';

export class UsersManager {
    // Constructor que inicializa la instancia del servicio y el arreglo de usuarios
    constructor() {
        // Instancia del servicio específico para usuarios del panel de administración
        this.userService = new UserServices();
        this.users = [];
    }

    // Método para inicializar la carga de usuarios y configurar eventos
    async init() {
        await this.loadUsers();
        this.setupEventListeners();
    }

    // Método para cargar la lista de usuarios desde el backend
    async loadUsers() {
        try {
            // Obtenemos todos los usuarios desde la API
            const users = await this.userService.getAllUser();
            
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
        const tableBody = document.getElementById('tablaUsuarios');
        if (!tableBody) {
            console.error('Elemento tbody con id "tablaUsuarios" no encontrado');
            return;
        }

        // Generar el HTML para cada fila de usuario y asignarlo al tbody
        const html = users.map(user => this.createUserRow(user)).join('');
        tableBody.innerHTML = html;

        // Inicializar eventos para los botones de cada fila
        this.initializeButtons();
    }

    // Método para crear el HTML de una fila de usuario
    createUserRow(user) {
        return `
            <tr>
                <td>${user.nombre || ''}</td>
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
        try {
            // Obtener usuario específico desde el backend o usar la caché local
            let user = this.users.find(u => u.id === id);
            
            // Si se necesitan detalles adicionales, se puede hacer una petición específica
            if (!user) {
                user = await this.userService.getUserById(id);
                if (!user) {
                    this.showMessage('No se pudo encontrar el usuario', 'danger');
                    return;
                }
            }

            const modalContent = `
                <div class="row">
                    <div class="col-12">
                        <h4>Detalles del Usuario</h4>
                        <hr>
                        <p><strong>Nombre:</strong> ${user.nombre || 'No especificado'}</p>
                        <p><strong>Email:</strong> ${user.email || 'No especificado'}</p>
                        <p><strong>Rol:</strong> ${user.rol || 'cliente'}</p>
                        <p><strong>Estado:</strong> ${user.estado || 'inactivo'}</p>
                        <p><strong>Teléfono:</strong> ${user.telefono || 'No especificado'}</p>
                        <p><strong>Dirección:</strong> ${user.direccion || 'No especificado'}</p>
                    </div>
                </div>
            `;

            // Mostrar modal con la información del usuario
            document.getElementById('userModalBody').innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        } catch (error) {
            console.error('Error al ver usuario:', error);
            this.showMessage('Error al cargar los detalles del usuario', 'danger');
        }
    }

    // Método para mostrar el formulario de edición de usuario en un modal
    async editUser(id) {
        try {
            const user = this.users.find(u => u.id === id);
            if (!user) {
                this.showMessage('No se pudo encontrar el usuario', 'danger');
                return;
            }

            const modalContent = `
                <form id="editUserForm">
                    <input type="hidden" id="userId" value="${user.id}">
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="editNombre" value="${user.nombre || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="editEmail" value="${user.email || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Teléfono</label>
                        <input type="tel" class="form-control" id="editTelefono" value="${user.telefono || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Dirección</label>
                        <input type="text" class="form-control" id="editDireccion" value="${user.direccion || ''}">
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
            document.getElementById('editUserModalBody').innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();

            // Asignar evento para manejar el envío del formulario
            const form = document.getElementById('editUserForm');
            // Eliminar eventos previos para evitar duplicaciones
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener('submit', (e) => this.handleEditUser(e));
        } catch (error) {
            console.error('Error al editar usuario:', error);
            this.showMessage('Error al cargar el formulario de edición', 'danger');
        }
    }

    // Método para manejar el envío del formulario de edición y actualizar el usuario
    async handleEditUser(e) {
        e.preventDefault();

        try {
            const userId = document.getElementById('userId').value;
            
            // Recopilar datos del formulario
            const userData = {
                nombre: document.getElementById('editNombre').value,
                email: document.getElementById('editEmail').value,
                telefono: document.getElementById('editTelefono').value,
                direccion: document.getElementById('editDireccion').value,
                rol: document.getElementById('editRol').value,
                estado: document.getElementById('editEstado').value
            };

            // Actualizar usuario en backend
            await this.userService.updateUser(userId, userData);
            
            // Cerrar modal de edición
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            
            // Recargar lista de usuarios
            await this.loadUsers();
            
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
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;
        const container = document.querySelector('.content');
        if (container) {
            container.prepend(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Método para configurar eventos globales si es necesario
    setupEventListeners() {
        // Configurar evento para formulario de agregar usuario si existe
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }
    }

    // Método para manejar agregar un nuevo usuario
    async handleAddUser(e) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const newUser = {
                nombre: form.querySelector('#newNombre').value,
                email: form.querySelector('#newEmail').value,
                telefono: form.querySelector('#newTelefono').value,
                direccion: form.querySelector('#newDireccion').value,
                rol: form.querySelector('#newRol').value,
                estado: 'activo',
                contrasena: form.querySelector('#newContrasena').value
            };
            
            await this.userService.registerUser(newUser);
            
            // Cerrar modal si existe
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            if (modal) modal.hide();
            
            // Resetear formulario
            form.reset();
            
            // Recargar lista de usuarios
            await this.loadUsers();
            
            this.showMessage('Usuario agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error al agregar usuario:', error);
            this.showMessage('Error al agregar usuario', 'danger');
        }
    }
}
// Importación del servicio para manejo de usuarios desde el archivo correcto
import { UserServices } from '../services/admin/manage_user_services.js';
import { UIService } from '../services/ui-service.js';

/**
 * Clase que gestiona los usuarios en el panel de administración
 * Permite listar, crear, editar y eliminar usuarios
 */
export class UsersManager {
    /**
     * Constructor que inicializa servicios y estado interno
     */
    constructor() {
        // Servicios necesarios
        this.userService = new UserServices();
        this.uiService = new UIService();
        
        // Almacenamiento de usuarios
        this.users = [];
    }

    /**
     * Inicializa el gestor de usuarios, cargando datos y eventos
     * @async
     */
    async init() {
        try {
            await this.loadUsers();
            this.setupEventListeners();
            console.log('Gestor de usuarios inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar gestor de usuarios:', error);
            this.showMessage('Error al inicializar. Verifique la conexión con el servidor', 'danger');
        }
    }

    /**
     * Carga todos los usuarios desde el backend
     * @async
     */
    async loadUsers() {
        try {
            // Mostrar indicador de carga
            const container = document.querySelector('.content');
            if (container) {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.id = 'users-loading';
                loadingIndicator.className = 'text-center my-4';
                loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
                container.prepend(loadingIndicator);
            }

            // Obtenemos todos los usuarios desde la API
            const users = await this.userService.getAllUsers();
            
            // Validar que la respuesta sea un arreglo
            if (!Array.isArray(users)) {
                console.error('Se esperaba un arreglo de usuarios pero se recibió:', typeof users);
                this.showMessage('Error al cargar usuarios. Formato de respuesta incorrecto', 'danger');
                this.users = [];
                return;
            }

            // Guardar usuarios y renderizarlos en la tabla
            this.users = users;
            this.renderUsers(users);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.showMessage('Error al cargar usuarios. Verifique la conexión con el servidor', 'danger');
            this.renderUsers([]);
        } finally {
            // Eliminar indicador de carga
            document.getElementById('users-loading')?.remove();
        }
    }

    /**
     * Renderiza la tabla de usuarios en la interfaz
     * @param {Array} users - Lista de usuarios a mostrar
     */
    renderUsers(users) {
        const tableBody = document.getElementById('tablaUsuarios');
        if (!tableBody) {
            console.error('Elemento tbody con id "tablaUsuarios" no encontrado');
            return;
        }

        if (!users || users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">
                        <p class="text-muted">No hay usuarios disponibles</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Generar el HTML para cada fila de usuario y asignarlo al tbody
        const html = users.map(user => this.createUserRow(user)).join('');
        tableBody.innerHTML = html;

        // Inicializar eventos para los botones de cada fila
        this.initializeButtons();
    }

    /**
     * Crea el HTML para una fila de la tabla de usuarios
     * @param {Object} user - Datos del usuario
     * @returns {string} HTML de la fila
     */
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
                        <button class="btn btn-sm btn-info view-user" data-id="${user.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-user" data-id="${user.id}" title="Editar usuario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}" title="Eliminar usuario">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Configura los listeners para los botones de acciones
     */
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

    /**
     * Muestra los detalles de un usuario en un modal
     * @param {string} id - ID del usuario a ver
     * @async
     */
    async viewUser(id) {
        try {
            // Mostrar spinner mientras carga
            document.getElementById('userModalBody').innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();

            // Obtener usuario específico desde el backend o usar la caché local
            let user = this.users.find(u => u.id === id);
            
            // Si no está en caché, buscarlo en el backend
            if (!user) {
                user = await this.userService.getUserById(id);
                if (!user) {
                    this.showMessage('No se pudo encontrar el usuario', 'danger');
                    modal.hide();
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
                        <p><strong>Estado:</strong> <span class="badge bg-${user.estado === 'activo' ? 'success' : 'danger'}">${user.estado || 'inactivo'}</span></p>
                        <p><strong>Teléfono:</strong> ${user.telefono || 'No especificado'}</p>
                        <p><strong>Dirección:</strong> ${user.direccion || 'No especificado'}</p>
                        <p><strong>Fecha de registro:</strong> ${user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString() : 'No disponible'}</p>
                    </div>
                </div>
            `;

            // Actualizar modal con la información del usuario
            document.getElementById('userModalBody').innerHTML = modalContent;
        } catch (error) {
            console.error('Error al ver usuario:', error);
            this.showMessage('Error al cargar los detalles del usuario', 'danger');
        }
    }

    /**
     * Muestra el formulario de edición de un usuario
     * @param {string} id - ID del usuario a editar
     * @async
     */
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
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar cambios</button>
                    </div>
                </form>
            `;

            // Mostrar modal con formulario de edición
            document.getElementById('editUserModalBody').innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();

            // Asignar evento para manejar el envío del formulario
            const form = document.getElementById('editUserForm');
            form.addEventListener('submit', (e) => this.handleEditUser(e));
        } catch (error) {
            console.error('Error al editar usuario:', error);
            this.showMessage('Error al cargar el formulario de edición', 'danger');
        }
    }

    /**
     * Procesa el formulario de edición de usuario
     * @param {Event} e - Evento del formulario
     * @async
     */
    async handleEditUser(e) {
        e.preventDefault();

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;
            }

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
            if (modal) modal.hide();
            
            // Recargar lista de usuarios
            await this.loadUsers();
            
            this.showMessage('Usuario actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            this.showMessage('Error al actualizar usuario: ' + (error.message || 'Error desconocido'), 'danger');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar cambios';
            }
        }
    }

    /**
     * Elimina un usuario previa confirmación
     * @param {string} id - ID del usuario a eliminar
     * @async
     */
    async deleteUser(id) {
        if (confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            try {
                // Mostrar indicador de carga
                const loadingElement = document.createElement('div');
                loadingElement.className = 'position-fixed top-50 start-50 translate-middle bg-white p-3 rounded shadow';
                loadingElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="spinner-border text-primary me-3" role="status">
                            <span class="visually-hidden">Eliminando...</span>
                        </div>
                        <span>Eliminando usuario...</span>
                    </div>
                `;
                document.body.appendChild(loadingElement);
                
                // Eliminar usuario en backend
                await this.userService.deleteUser(id);
                
                // Recargar lista de usuarios
                await this.loadUsers();
                
                this.showMessage('Usuario eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                this.showMessage('Error al eliminar usuario: ' + (error.message || 'Error en el servidor'), 'danger');
            } finally {
                // Eliminar indicador de carga
                const loadingElement = document.querySelector('.position-fixed.top-50.start-50');
                if (loadingElement) loadingElement.remove();
            }
        }
    }

    /**
     * Muestra un mensaje en la interfaz
     * @param {string} message - Texto del mensaje
     * @param {string} type - Tipo de alerta (success, danger, warning, etc)
     */
    showMessage(message, type) {
        if (this.uiService) {
            this.uiService.showMessage(message, type);
            return;
        }
        
        // Fallback si UIService no está disponible
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

    /**
     * Configura los listeners para los formularios
     */
    setupEventListeners() {
        // Configurar evento para formulario de agregar usuario si existe
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }
        
        // Configurar evento para el botón de limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Configurar evento para filtrar usuarios
        const searchInput = document.getElementById('searchUsers');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterUsers());
        }
        
        // Configurar evento para filtrar por rol
        const roleSelect = document.getElementById('filterRole');
        if (roleSelect) {
            roleSelect.addEventListener('change', () => this.filterUsers());
        }
    }

    /**
     * Filtra la lista de usuarios según los criterios seleccionados
     */
    filterUsers() {
        const searchValue = document.getElementById('searchUsers')?.value?.toLowerCase() || '';
        const roleValue = document.getElementById('filterRole')?.value || '';
        
        let filteredUsers = [...this.users];
        
        if (searchValue) {
            filteredUsers = filteredUsers.filter(user => 
                user.nombre?.toLowerCase().includes(searchValue) || 
                user.email?.toLowerCase().includes(searchValue)
            );
        }
        
        if (roleValue) {
            filteredUsers = filteredUsers.filter(user => user.rol === roleValue);
        }
        
        this.renderUsers(filteredUsers);
    }
    
    /**
     * Limpia los filtros aplicados a la lista de usuarios
     */
    clearFilters() {
        const searchInput = document.getElementById('searchUsers');
        const roleSelect = document.getElementById('filterRole');
        
        if (searchInput) searchInput.value = '';
        if (roleSelect) roleSelect.value = '';
        
        this.renderUsers(this.users);
    }

    /**
     * Procesa el formulario para agregar un nuevo usuario
     * @param {Event} e - Evento del formulario
     * @async
     */
    async handleAddUser(e) {
        e.preventDefault();
        
        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;
            }
            
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
            this.showMessage('Error al agregar usuario: ' + (error.message || 'Error en el servidor'), 'danger');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar';
            }
        }
    }
}

// Exportar singleton para uso global
export default new UsersManager();
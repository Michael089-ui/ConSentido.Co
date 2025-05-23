document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarDatosPerfil();
    setupEventListeners();
});

function verificarSesion() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/pages/customer/Login.html';
        return;
    }
}

function cargarDatosPerfil() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = document.getElementById('profileData');
    
    if (currentUser) {
        profileData.innerHTML = `
            <div class="mb-3">
                <label class="form-label fw-bold">Nombre</label>
                <p>${currentUser.name || 'No especificado'}</p>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Email</label>
                <p>${currentUser.email}</p>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Tipo de documento</label>
                <p>${currentUser.tipoDoc || 'No especificado'}</p>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Número de documento</label>
                <p>${currentUser.numeroDoc || 'No especificado'}</p>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Manejar cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Manejar edición de perfil
    document.getElementById('editProfileBtn').addEventListener('click', handleEditProfile);
}

function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '/pages/customer/Login.html';
    }
}

function handleEditProfile() {
    // Por implementar: lógica de edición de perfil
    alert('Función de edición en desarrollo');
}
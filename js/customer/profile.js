document.addEventListener('DOMContentLoaded', function() {
    new ProfileManager();
});

class ProfileManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = '/pages/customer/Login.html';
            return;
        }
        this.loadUserProfile();
        this.setupEventListeners();
    }

    loadUserProfile() {
        const profileData = document.getElementById('profileData');
        
        if (!profileData) return;

        profileData.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Nombre:</label>
                    <p class="border-bottom pb-2">${this.currentUser.nombre || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Apellido:</label>
                    <p class="border-bottom pb-2">${this.currentUser.apellido || 'No especificado'}</p>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Email:</label>
                    <p class="border-bottom pb-2">${this.currentUser.email || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Teléfono:</label>
                    <p class="border-bottom pb-2">${this.currentUser.telefono || 'No especificado'}</p>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-12">
                    <label class="form-label fw-bold">Dirección:</label>
                    <p class="border-bottom pb-2">${this.currentUser.direccion || 'No especificado'}</p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = '/index.html';
            });
        }
    }
}
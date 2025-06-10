import { BASE_API_URL } from '../config';

// Servicio para manejar autenticación con backend
export class AuthService {
    constructor() {
        this.apiUrl = BASE_API_URL;
    }

    // Método para hacer login enviando credenciales al backend
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // para enviar cookies de sesión
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en login');
            }

            // Retorna datos del usuario autenticado (según respuesta backend)
            const userData = await response.json();
            return userData; // Debe incluir el rol del usuario

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Método para obtener el usuario autenticado actual desde backend
    async getCurrentUser() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/me`, {
                credentials: 'include' // para enviar cookies de sesión
            });

            if (!response.ok) {
                throw new Error('No autenticado');
            }

            const userData = await response.json();
            return userData; // Debe incluir el rol del usuario

        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            return null;
        }
    }

    // Método para cerrar sesión en backend
    async logout() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al cerrar sesión');
            }

            // Redirigir a login o página principal
            window.location.href = '/pages/customer/Login.html';

        } catch (error) {
            console.error('Error en logout:', error);
            // Igual redirigir para evitar quedar en sesión inválida
            window.location.href = '/pages/customer/Login.html';
        }
    }
}
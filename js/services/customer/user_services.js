// Importación de la URL base de la API desde configuración
import { BASE_API_URL } from "../config";

// Clase para manejar la información del usuario autenticado (comprador)
export class UserServices {
    // Constructor que inicializa la URL base de la API
    constructor() {
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos para obtener y gestionar la información del usuario autenticado

    // Método para obtener el perfil del usuario autenticado
    async getCurrentUser() {
        try {
            // Realiza la petición al endpoint del backend para obtener el perfil
            const response = await fetch(`${this.apiUrl}/usuarios/perfil`, {
                credentials: 'include' // Enviar cookies o token automáticamente
            });

            // Si la respuesta no es exitosa, lanza un error
            if (!response.ok) {
                throw new Error('Error al cargar el perfil del usuario');
            }

            // Retorna la respuesta convertida a JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores de red o servidor
            console.error('Error al obtener el perfil del usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // Método para cerrar la sesión del usuario
    async logout() {
        try {
            // Realiza la petición al endpoint del backend para cerrar sesión
            await fetch(`${this.apiUrl}/auth/logout`, {
                method: 'POST', // Método HTTP POST para cerrar sesión
                credentials: 'include' // Enviar cookies o token automáticamente
            });

            // No es necesario procesar la respuesta, solo verificar que no haya error

        } catch (error) {
            // Manejo de errores de red o servidor
            console.error('Error al cerrar sesión:', error);
            // No se lanza el error para no interrumpir el flujo
        }

        // Redirige al usuario a la página de inicio
        window.location.href = '/index.html';
    }
}
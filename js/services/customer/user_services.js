// Importación de la URL base de la API desde configuración
import { BASE_API_URL } from "../config";

// Clase para manejar la información del usuario autenticado (comprador)
export class CustomerUserService {
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
    
    // Método para registrar un nuevo usuario
    async registerUser(userData) {
        try {
            // Realizar la petición al endpoint de registro
            const response = await fetch(`${this.apiUrl}/usuarios/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            // Retornar datos del usuario registrado
            return await response.json();
        } catch (error) {
            console.error('Error en el registro de usuario:', error);
            throw error; // Re-lanzar el error para manejarlo en el componente
        }
    }

    // Método para actualizar la información del perfil
    async updateProfile(userData) {
        try {
            // Realizar la petición al endpoint de actualización de perfil
            const response = await fetch(`${this.apiUrl}/usuarios/actualizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Enviar cookies o token automáticamente
                body: JSON.stringify(userData)
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar perfil');
            }

            // Retornar datos del perfil actualizado
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error; // Re-lanzar el error para manejarlo en el componente
        }
    }

    // Método para obtener el historial de pedidos del usuario
    async getOrderHistory() {
        try {
            // Realizar la petición al endpoint de historial de pedidos
            const response = await fetch(`${this.apiUrl}/pedidos/historial`, {
                credentials: 'include' // Enviar cookies o token automáticamente
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error('Error al cargar el historial de pedidos');
            }

            // Retornar historial de pedidos
            return await response.json();
        } catch (error) {
            console.error('Error al obtener historial de pedidos:', error);
            throw error; // Re-lanzar el error para manejarlo en el componente
        }
    }
}
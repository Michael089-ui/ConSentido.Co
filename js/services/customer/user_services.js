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

    
}
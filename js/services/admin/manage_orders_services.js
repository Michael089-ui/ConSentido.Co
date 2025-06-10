// Importación de la URL base de la API desde configuración
import { BASE_API_URL } from "../config";

// Clase para manejar operaciones relacionadas con órdenes (lado administrador)
export class OrderService {
    // Constructor que inicializa la URL base del backend
    constructor() {
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos para interactuar con la API de pedidos

    // Método para obtener todos los pedidos
    async getAllOrders() {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos`, {
                credentials: 'include' // Enviar cookies o token automáticamente si aplica
            });

            if (!response.ok) throw new Error('Error al cargar pedidos');

            // Retorna la lista de pedidos en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y retorno de lista vacía en caso de fallo
            console.error('Error al obtener pedidos:', error);
            return [];
        }
    }

    // Método para crear una nueva orden
    async createOrder(orderData) {
        try {
            console.log('Enviando orden:', orderData);

            const response = await fetch(`${this.apiUrl}/pedidos`, {
                method: 'POST', // Método HTTP POST para crear recurso
                headers: {
                    'Content-Type': 'application/json' // Indica que se envía JSON
                },
                credentials: 'include',
                body: JSON.stringify(orderData) // Convierte el objeto a JSON
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Error al crear pedido');
            }

            // Retorna la orden creada en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores de red o servidor
            console.error('Error en createOrder:', error);
            throw error;
        }
    }

    // Método para actualizar el estado de una orden
    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos/${id}`, {
                method: 'PATCH', // Método HTTP PATCH para actualización parcial
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ estado: status })
            });

            if (!response.ok) throw new Error('Error al actualizar estado');

            // Retorna la orden actualizada en formato JSON
            return await response.json();

        } catch (error) {
            // Manejo de errores y relanzamiento para que el llamador lo gestione
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    }
}
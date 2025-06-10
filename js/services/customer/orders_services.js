import { BASE_API_URL } from "../config";

// Servicio para manejar las órdenes del usuario comprador
export class OrderService {
    constructor() {
        // URL base de la API
        this.apiUrl = BASE_API_URL;
    }

    // Obtengo las órdenes del usuario autenticado
    async getUserOrders() {
        try {
            // Se asume que el backend identifica al usuario por token o sesión
            const response = await fetch(`${this.apiUrl}/pedidos/mis-pedidos`, {
                credentials: 'include' // o enviar token en headers según implementación
            });
            if (!response.ok) throw new Error('Error al cargar tus pedidos');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener pedidos del usuario:', error);
            return [];
        }
    }

    // Obtengo detalles de una orden específica del usuario
    async getOrderById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos/mis-pedidos/${id}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Error al cargar el pedido');
            return await response.json();
        } catch (error) {
            console.error(`Error al obtener pedido con ID ${id}:`, error);
            return null;
        }
    }

    // Creo una nueva orden para el usuario autenticado
    async createOrder(orderData) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Error al crear pedido');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en createOrder:', error);
            throw error;
        }
    }

    // Actualizo el estado de una orden propia (ej. cancelar)
    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos/mis-pedidos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ estado: status })
            });
            
            if (!response.ok) throw new Error('Error al actualizar estado');
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    }
}
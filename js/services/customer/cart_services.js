// Este archivo se encarga de manejar el carrito de compras del cliente, comunicándose con el backend

import { BASE_API_URL } from "../config.js";

export class CustomerCartService {
    constructor() {
        // Guardamos la URL base de la API para usarla en las peticiones
        this.apiUrl = BASE_API_URL;
    }

    // Obtengo los productos actuales del carrito desde el backend
    async getCart() {
        try {
            const response = await fetch(`${this.apiUrl}/carrito`);
            if (!response.ok) throw new Error('No se pudo obtener el carrito');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return []; // Retornamos un array vacío para evitar fallos en la UI
        }
    }

    // Agrego un producto al carrito enviando los datos al backend
    async addToCart(producto) {
        try {
            const response = await fetch(`${this.apiUrl}/carrito`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
            if (!response.ok) throw new Error('No se pudo agregar el producto al carrito');
            return await response.json(); // Retornamos la respuesta del backend (carrito actualizado o confirmación)
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            throw error; // Propagamos el error para que la UI pueda manejarlo
        }
    }

    // Elimino un producto del carrito usando su ID
    async removeFromCart(productId) {
        try {
            const response = await fetch(`${this.apiUrl}/carrito/${productId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('No se pudo eliminar el producto del carrito');
            // No retornamos nada, solo confirmamos que se eliminó correctamente
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            throw error; // Propagamos el error para manejo en la UI
        }
    }

    // Limpio todo el carrito eliminando todos los productos
    async clearCart() {
        try {
            const response = await fetch(`${this.apiUrl}/carrito`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('No se pudo vaciar el carrito');
            // Confirmación de carrito vacío, no retornamos datos
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            throw error; // Propagamos el error para manejo en la UI
        }
    }
}
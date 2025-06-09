// Este archivo se encarga de manejar el carrito de compras del cliente

import { BASE_API_URL } from "../config.js";

export class cart_service {
    constructor() {
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
            return [];
        }
    }

    // Agrego un producto al carrito desde el backend
    async addToCart(producto) {
        try {
            const response = await fetch(`${this.apiUrl}/carrito`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
            if (!response.ok) throw new Error('No se pudo agregar el producto al carrito');
            return await response.json();
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            throw error;
        }
    }

    // Elimino un producto del carrito
    async removeFromCart(productId) {
        try {
            const response = await fetch(`${this.apiUrl}/carrito/${productId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('No se pudo eliminar el producto del carrito');
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
        }
    }

    // Limpio todo el carrito
    async clearCart() {
        try {
            const response = await fetch(`${this.apiUrl}/carrito`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('No se pudo vaciar el carrito');
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
        }
    }
}

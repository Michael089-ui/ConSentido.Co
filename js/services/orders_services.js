export class OrderService {
    constructor() {
        this.apiUrl = 'http://localhost:8080';
    }

    async getAllOrders() {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos`);
            if (!response.ok) throw new Error('Error al cargar pedidos');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }


    async createOrder(orderData) {
        try {
            console.log('Enviando orden:', orderData);
            const response = await fetch(`${this.apiUrl}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: status })
            });
            
            if (!response.ok) throw new Error('Error al actualizar estado');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}
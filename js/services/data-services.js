export class DataService {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';  // json-server URL
    }

    async getAllProducts() {
        try {
            const response = await fetch(`${this.apiUrl}/productos`);
            if (!response.ok) throw new Error('Error al cargar productos');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async addProduct(product) {
        try {
            const response = await fetch(`${this.apiUrl}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product)
            });
            
            if (!response.ok) throw new Error('Error al agregar producto');
            return await response.json();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct)
            });
            
            if (!response.ok) throw new Error('Error al actualizar producto');
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const response = await fetch(`${this.apiUrl}/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al eliminar producto');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    }

    async getProductsByCategory(category) {
        try {
            const response = await fetch(`${this.apiUrl}/productos?categoria=${category}`);
            if (!response.ok) throw new Error('Error al cargar productos por categoría');
            return await response.json();
        } catch (error) {
            console.error('Error al filtrar productos:', error);
            return [];
        }
    }
}
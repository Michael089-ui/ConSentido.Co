export class DataService {
    constructor() {
        this.dbPath = '/data/productos.json';
    }

    async getAllProducts() {
        try {
            const response = await fetch(this.dbPath);
            if (!response.ok) throw new Error('Error al cargar productos');
            const data = await response.json();
            return data.productos;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async getProductsByCategory(category) {
        const productos = await this.getAllProducts();
        return productos.filter(p => p.categoria === category);
    }

    async addProduct(product) {
        try {
            const productos = await this.getAllProducts();
            product.id = Date.now();
            productos.push(product);
            await this.saveProducts(productos);
            return product;
        } catch (error) {
            console.error('Error al agregar producto:', error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const productos = await this.getAllProducts();
            const index = productos.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                productos[index] = { ...productos[index], ...updatedProduct };
                await this.saveProducts(productos);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const productos = await this.getAllProducts();
            const filteredProducts = productos.filter(p => p.id !== parseInt(id));
            await this.saveProducts(filteredProducts);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    }

    async saveProducts(products) {
        try {
            const response = await fetch(this.dbPath, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productos: products })
            });
            
            if (!response.ok) throw new Error('Error al guardar productos');
        } catch (error) {
            console.error('Error al guardar:', error);
            throw error;
        }
    }
}
export class UserService {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
    }

    async getAllUsers() {
        try {
            console.log('Fetching users from:', `${this.apiUrl}/usuarios`);
            const response = await fetch(`${this.apiUrl}/usuarios`);
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const users = await response.json();
            console.log('Users fetched:', users);
            // Return the array directly since the server returns it in that format
            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async addUser(user) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al agregar usuario');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) throw new Error('Error al actualizar usuario');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al eliminar usuario');
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }


    async registerUser(user) {
    try {
        const response = await fetch(`http://localhost:8080/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al registrar usuario');
        }

        return await response.text(); // porque tu backend devuelve un mensaje de texto
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

}
//Importación de la API
import { BASE_API_URL } from "./config";

//Clase para manejar -users-
export class user_services{
    // Constructor de la clase que se ejecuta cuando se crea una nueva instancia
    constructor(){
        // URL base del backend como propiedad de la clase
        this.apiUrl = BASE_API_URL;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Métodos que tendra la clase que permitirá que podamos hacer llamadas a la API del backend (CRUD)
    
    //Método para registrar un nuevo User (CREATE)
    async registerUser(userData){
        //try para manejo de errores 
        try {
            const response = await fetch(`${this.apiUrl}/usuarios`,{
                method: 'POST',//aquí estamos indicando el tipo de peticion que se hará
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(userData)//se convierte los datos a JSON
            });

            if(!response.ok){
                throw new Error('No se pudo registrar el usuario');
            }

            //Si la peticion fue correcta se convierte el objeto
            return await response.json();
            
        } catch (error) {

            //si hubo errores de red o servidor, se muestra en consola
            console.error('Error al registrar el usuario', error);
            throw error;
            
        }

    }

    //Método para obtener lista de todos los usuarios
    async getAllUser(){
        try {

            const response = await fetch(`${this.apiUrl}/usuarios`);

            // si la respuesta no fue exitosa, lanzamos error
            if (!response.ok) {
                throw new Error('No se pudieron obtener los usuarios');
            }

            // si todo bien, retornamos los datos en formato JSON
            return await response.json();

        } catch (error) {
            // si hay error, lo mostramos y devolvemos lista vacía
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    }


     //Método para obtener un solo usuario por su ID
    async getUserById(id) {
        try {
            // petición GET para un solo usuario
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`);

            if (!response.ok) {
                throw new Error(`No se pudo obtener el usuario con ID ${id}`);
            }

            // se retorna el usuario encontrado
            return await response.json();

        } catch (error) {
            console.error(`Error al obtener el usuario con ID ${id}:`, error);
            return null; // retornamos null si hubo error
        }
    }

    //Método para actualizar info de un usuario
    async updateUser(id, newData) {
        try {
            // usamos PUT 
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });

            if (!response.ok) {
                throw new Error(`No se pudo actualizar el usuario con ID ${id}`);
            }

            // retornamos el resultado actualizado
            return await response.json();

        } catch (error) {
            console.error(`Error al actualizar el usuario con ID ${id}:`, error);
            throw error;
        }
    }

    //Método para eliminar un usuario por ID
    async deleteUser(id) {
        try {
            // petición DELETE para eliminar el usuario
            const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`No se pudo eliminar el usuario con ID ${id}`);
            }

            // si todo va bien, devolvemos true
            return true;

        } catch (error) {
            console.error(`Error al eliminar el usuario con ID ${id}:`, error);
            return false;
        }
    }
}


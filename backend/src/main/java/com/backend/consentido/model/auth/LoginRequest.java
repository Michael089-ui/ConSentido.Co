package com.backend.consentido.model.auth;

// DTOS generados para llevar mejores practicas de desarrollo con Spring Security Request && Response
public class LoginRequest {

    private String nombre;
    private String contrasena;

    public LoginRequest() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}

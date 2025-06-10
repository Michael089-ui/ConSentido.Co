package com.backend.consentido.controller;

import com.backend.consentido.dto.UsuarioRequestDTO;
import com.backend.consentido.dto.UsuarioResponseDTO;
import com.backend.consentido.mapper.UsuarioMapper;
import com.backend.consentido.model.Usuario;
import com.backend.consentido.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final IUsuarioService usuarioService;

    @Autowired
    public UsuarioController(IUsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioService.obtenerTodos().stream()
                .map(UsuarioMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(UsuarioMapper.toDTO(usuario));
    }

    @PostMapping
    public ResponseEntity<String> guardarUsuario(@RequestBody UsuarioRequestDTO usuarioDTO) {
        Usuario usuario = UsuarioMapper.toEntity(usuarioDTO);
        usuarioService.guardarUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario creado correctamente");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> editarUsuario(@PathVariable Long id, @RequestBody UsuarioRequestDTO usuarioDTO) {
        Usuario usuario = UsuarioMapper.toEntity(usuarioDTO);
        usuarioService.editarUsuario(id, usuario);
        return ResponseEntity.ok("Usuario actualizado");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario eliminado");
    }
}

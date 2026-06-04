const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario.model');

class UsuarioController {
    static async crearUsuario(req, res) {
        try {
            const { Nombre, Email, Password, Telefono, Rol = 'usuario' } = req.body;

            if (!Nombre || !Email || !Password) {
                return res.status(400).json({
                    mensaje: 'Nombre, Email y Password son obligatorios'
                });
            }

            const rolesValidos = ['usuario', 'admin', 'trabajador'];

            if (!rolesValidos.includes(Rol)) {
                return res.status(400).json({
                    mensaje: 'Rol inválido. Los roles permitidos son usuario, admin y trabajador'
                });
            }

            const usuarioExistente = await Usuario.buscarPorEmail(Email);

            if (usuarioExistente) {
                return res.status(400).json({
                    mensaje: 'El correo ya está registrado'
                });
            }

            const passwordHash = await bcrypt.hash(Password, 10);

            const resultado = await Usuario.crearUsuario({
                Nombre,
                Email,
                Password: passwordHash,
                Telefono: Telefono || null,
                Rol
            });

            res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                ID_Usuario: resultado.insertId,
                Rol
        });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al crear usuario',
                error: error.message
            });
        }
    }

    static async obtenerUsuarioPorId(req, res) {
    try {
        const { id } = req.params;

        const usuario = await Usuario.obtenerPorId(id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(usuario);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener usuario',
            error: error.message
        });
    }
}
    static async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { Nombre, Email, Telefono } = req.body;

            if (!Nombre || !Email) {
                return res.status(400).json({
                    mensaje: 'Nombre y Email son obligatorios'
                });
            }

            const usuarioExistente = await Usuario.obtenerPorId(id);

            if (!usuarioExistente) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            const resultado = await Usuario.actualizarUsuario(id, {
                Nombre,
                Email,
                Telefono: Telefono || null
            });

            res.json({
                mensaje: 'Usuario actualizado correctamente',
                resultado
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }
    
    static async desactivarUsuario(req, res) {
        try {
            const { id } = req.params;

            const usuario = await Usuario.obtenerPorId(id);

            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            const resultado = await Usuario.desactivarUsuario(id);

            if (resultado.affectedRows === 0) {
                return res.status(400).json({
                    mensaje: 'No se pudo desactivar el usuario'
                });
            }

            res.json({
                mensaje: 'Usuario desactivado correctamente'
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al desactivar usuario',
                error: error.message
            });
        }
    }

    static async activarUsuario(req, res) {
    try {
        const { id } = req.params;

        const resultado = await Usuario.activarUsuario(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario activado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al activar usuario',
            error: error.message
        });
    }
}
}


module.exports = UsuarioController;
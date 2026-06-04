const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario.model');
const Trabajador = require('../models/Trabajador.model');

class AuthController {

    // LOGIN USUARIO
    static async loginUsuario(req, res) {
        try {
            const { Email, Password } = req.body;

            if (!Email || !Password) {
                return res.status(400).json({
                    mensaje: 'Correo y Password son obligatorios'
                });
            }

            const usuario = await Usuario.buscarPorEmail(Email);

            if (!usuario) {
                return res.status(401).json({
                    mensaje: 'Credenciales incorrectas'
                });
            }

            if (!usuario.is_active) {
                return res.status(403).json({
                    mensaje: 'Usuario desactivado'
                });
            }

            const passwordValido = await bcrypt.compare(
                Password,
                usuario.Password
            );

            if (!passwordValido) {
                return res.status(401).json({
                    mensaje: 'Credenciales incorrectas'
                });
            }

            const token = jwt.sign(
            {
                id: usuario.ID_Usuario,
                email: usuario.Email,
                tipo: 'usuario',
                rol: usuario.Rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
);

            res.json({
                mensaje: 'Login correcto',
                token,
                usuario: {
                    ID_Usuario: usuario.ID_Usuario,
                    Nombre: usuario.Nombre,
                    Email: usuario.Email,
                    Rol: usuario.Rol
                }
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al iniciar sesión',
                error: error.message
            });
        }
    }


    // LOGIN TRABAJADOR
    static async loginTrabajador(req, res) {
        try {
            const { Cedula, Password } = req.body;

            if (!Cedula || !Password) {
                return res.status(400).json({
                    mensaje: 'Cedula y Password son obligatorios'
                });
            }

            const trabajador = await Trabajador.buscarPorCedula(Cedula);

            if (!trabajador) {
                return res.status(401).json({
                    mensaje: 'Credenciales incorrectas'
                });
            }

            if (!trabajador.is_active) {
                return res.status(403).json({
                    mensaje: 'Trabajador desactivado'
                });
            }

            const passwordValido = await bcrypt.compare(
                Password,
                trabajador.Password
            );

            if (!passwordValido) {
                return res.status(401).json({
                    mensaje: 'Credenciales incorrectas'
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.ID_Usuario,
                    email: usuario.Email,
                    tipo: 'usuario',
                    rol: usuario.Rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                mensaje: 'Login correcto',
                token,
                trabajador: {
                    ID_Trabajador: trabajador.ID_Trabajador,
                    Nombre: trabajador.Nombre,
                    Cedula: trabajador.Cedula
                }
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al iniciar sesión',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;
const bcrypt = require('bcryptjs');
const Trabajador = require('../models/Trabajador.model');

class TrabajadorController {
    static async registrarTrabajador(req, res) {
        try {
            const { Nombre, Cedula, FechaContratacion, Password } = req.body;

            if (!Nombre || !Cedula || !FechaContratacion || !Password) {
                return res.status(400).json({
                    mensaje: 'Nombre, Cedula, FechaContratacion y Password son obligatorios'
                });
            }

            const existe = await Trabajador.buscarPorCedula(Cedula);

            if (existe) {
                return res.status(400).json({
                    mensaje: 'La cédula ya está registrada'
                });
            }

            const passwordHash = await bcrypt.hash(Password, 10);

            const resultado = await Trabajador.crearTrabajador({
                Nombre,
                Cedula,
                FechaContratacion,
                Password: passwordHash
            });

            res.status(201).json({
                mensaje: 'Trabajador registrado correctamente',
                ID_Trabajador: resultado.insertId
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al registrar trabajador',
                error: error.message
            });
        }
    }

    static async obtenerTrabajadorPorId(req, res) {
    try {
        const { id } = req.params;

        const trabajador = await Trabajador.obtenerPorId(id);

        if (!trabajador) {
            return res.status(404).json({
                mensaje: 'Trabajador no encontrado'
            });
        }

        res.json(trabajador);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener trabajador',
            error: error.message
        });
    }
}

    static async activarTrabajador(req, res) {
    try {
        const { id } = req.params;

        const resultado = await Trabajador.activarTrabajador(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Trabajador no encontrado'
            });
        }

        res.json({
            mensaje: 'Trabajador activado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al activar trabajador',
            error: error.message
        });
    }
    }

    static async desactivarTrabajador(req, res) {
        try {
            const { id } = req.params;

            const resultado = await Trabajador.desactivarTrabajador(id);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Trabajador no encontrado'
                });
            }

            res.json({
                mensaje: 'Trabajador desactivado correctamente'
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al desactivar trabajador',
                error: error.message
            });
        }
    }
    static async obtenerTrabajadorConTransportes(req, res) {
        try {
            const { id } = req.params;

            const datos = await Trabajador.obtenerConTransportes(id);

            if (datos.length === 0) {
                return res.status(404).json({
                    mensaje: 'Trabajador no encontrado'
                });
            }

            const trabajador = {
                ID_Trabajador: datos[0].ID_Trabajador,
                Nombre: datos[0].Nombre,
                Cedula: datos[0].Cedula,
                FechaContratacion: datos[0].FechaContratacion,
                transportes: []
            };

            datos.forEach(row => {
                if (row.ID_Transporte) {
                    trabajador.transportes.push({
                        ID_Transporte: row.ID_Transporte,
                        Placa: row.Placa,
                        Capacidad: row.Capacidad,
                        Costo: row.Costo,
                        Estado: row.Estado,
                        FechaAsignacion: row.FechaAsignacion
                    });
                }
            });

            res.json(trabajador);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener trabajador con transportes',
                error: error.message
            });
        }
    }

    static async obtenerTrabajadores(req, res){
        try{
            const Trabajadores = await Trabajador.obtenerTrabajadores();
            res.json(Trabajador);
        } catch (error) {
            res.status(500).json({
                mensaje: "Error al obtener los Trabajadores",
                error: error.message
            });
        }
    }

    // Método para crear un nuevo trabajador
    static async crearTrabajador(data){
    const {
        ID_Trabajador,
        Nombre,
        Cedula,
        FechaContratacion
    } = data;

    // Validación básica (opcional, pero recomendada)
    if (!ID_Trabajador || !Nombre || !Cedula || !FechaContratacion) {
        throw new Error('Faltan datos requeridos para crear el trabajador');
    }

    try {
        const [result] = await mysqlPool.query(`
            INSERT INTO trabajador (
                ID_Trabajador,
                Nombre,
                Cedula,
                FechaContratacion
            )
            VALUES (?, ?, ?, ?)
        `, [ID_Trabajador, Nombre, Cedula, FechaContratacion]);

        // Retornar el ID insertado o el resultado completo
        return {
            ID_Trabajador: result.insertId || ID_Trabajador,
            Nombre,
            Cedula,
            FechaContratacion
        };
    } catch (error) {
        console.error('Error al crear trabajador:', error);
        throw error; // Re-lanza para manejo superior
    }
    }

    static async obtenerTodosConTransportes(req, res) {
    try {
        const datos = await Trabajador.obtenerTodosConTransportes();

        const mapa = {};

        datos.forEach(row => {
            if (!mapa[row.ID_Trabajador]) {
                mapa[row.ID_Trabajador] = {
                    ID_Trabajador: row.ID_Trabajador,
                    Nombre: row.Nombre,
                    Cedula: row.Cedula,
                    FechaContratacion: row.FechaContratacion,
                    is_active: row.is_active,
                    transportes: []
                };
            }

            if (row.ID_Transporte) {
                mapa[row.ID_Trabajador].transportes.push({
                    ID_Transporte: row.ID_Transporte,
                    Placa: row.Placa,
                    Capacidad: row.Capacidad,
                    Costo: row.Costo,
                    Estado: row.Estado,
                    FechaAsignacion: row.FechaAsignacion
                });
            }
        });

        res.json({
            total: Object.keys(mapa).length,
            trabajadores: Object.values(mapa)
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener trabajadores con transportes',
            error: error.message
        });
    }
}

}

module.exports = TrabajadorController;
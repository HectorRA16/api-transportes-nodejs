const Transporte = require('../models/Transporte.model');

class TransporteController {
    static async crearTransporte(req, res) {
        try {
            const { Placa, Capacidad, Costo, Estado } = req.body;

            if (!Placa || !Capacidad || !Costo || !Estado) {
                return res.status(400).json({
                    mensaje: 'Placa, Capacidad, Costo y Estado son obligatorios'
                });
            }

            const transporteExistente = await Transporte.buscarPorPlaca(Placa);

            if (transporteExistente) {
                return res.status(400).json({
                    mensaje: 'La placa ya está registrada'
                });
            }

            const estadosValidos = ['activo', 'mantenimiento', 'inactivo'];

            if (!estadosValidos.includes(Estado)) {
                return res.status(400).json({
                    mensaje: 'Estado inválido'
                });
            }

            const resultado = await Transporte.crearTransporte({
                Placa,
                Capacidad,
                Costo,
                Estado
            });

            res.status(201).json({
                mensaje: 'Transporte registrado correctamente',
                ID_Transporte: resultado.insertId
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al registrar transporte',
                error: error.message
            });
        }
    }
    static async listarTransportesActivos(req, res) {
    try {
        const transportes = await Transporte.obtenerActivos();

        if (transportes.length === 0) {
            return res.status(404).json({
                mensaje: 'No hay transportes activos'
            });
        }

        res.json(transportes);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener transportes activos',
            error: error.message
        });
    }
}
static async darDeBajaTransporte(req, res) {
    try {
        const { id } = req.params;

        const transporte = await Transporte.obtenerPorId(id);

        if (!transporte) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        if (transporte.Estado === 'inactivo') {
            return res.status(400).json({
                mensaje: 'El transporte ya está inactivo'
            });
        }

        const resultado = await Transporte.darDeBaja(id);

        if (resultado.affectedRows === 0) {
            return res.status(400).json({
                mensaje: 'No se pudo dar de baja el transporte'
            });
        }

        res.json({
            mensaje: 'Transporte dado de baja correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al dar de baja el transporte',
            error: error.message
        });
    }
}
static async darDeAltaTransporte(req, res) {
    try {
        const { id } = req.params;

        const transporte = await Transporte.obtenerPorId(id);

        if (!transporte) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        if (transporte.Estado === 'activo') {
            return res.status(400).json({
                mensaje: 'El transporte ya está activo'
            });
        }

        const resultado = await Transporte.darDeAlta(id);

        if (resultado.affectedRows === 0) {
            return res.status(400).json({
                mensaje: 'No se pudo dar de alta el transporte'
            });
        }

        res.json({
            mensaje: 'Transporte activado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al activar el transporte',
            error: error.message
        });
    }
}
static async obtenerTransporteConTrabajadorActual(req, res) {
    try {
        const { id } = req.params;

        const data = await Transporte.obtenerConTrabajadorActual(id);

        if (!data) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        const respuesta = {
            ID_Transporte: data.ID_Transporte,
            Placa: data.Placa,
            Capacidad: data.Capacidad,
            Costo: data.Costo,
            Estado: data.Estado,
            trabajador_actual: null
        };

        if (data.ID_Trabajador) {
            respuesta.trabajador_actual = {
                ID_Trabajador: data.ID_Trabajador,
                Nombre: data.Nombre,
                Cedula: data.Cedula,
                FechaContratacion: data.FechaContratacion,
                is_active: data.is_active,
                FechaAsignacion: data.FechaAsignacion
            };
        }

        res.json(respuesta);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener transporte con trabajador actual',
            error: error.message
        });
    }
}
static async actualizarTransporte(req, res) {
    try {
        const { id } = req.params;
        const { Placa, Capacidad, Costo, Estado } = req.body;

        if (!Placa || !Capacidad || !Costo || !Estado) {
            return res.status(400).json({
                mensaje: 'Placa, Capacidad, Costo y Estado son obligatorios'
            });
        }

        const transporteExistente = await Transporte.obtenerPorId(id);

        if (!transporteExistente) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        //Validar placa única
        const existentePlaca = await Transporte.buscarPorPlaca(Placa);

        if (existentePlaca && existentePlaca.ID_Transporte != id) {
            return res.status(400).json({
                mensaje: 'La placa ya está registrada en otro transporte'
            });
        }

        const estadosValidos = ['activo', 'mantenimiento', 'inactivo'];

        if (!estadosValidos.includes(Estado)) {
            return res.status(400).json({
                mensaje: 'Estado inválido'
            });
        }

        await Transporte.actualizarTransporte(id, {
            Placa,
            Capacidad,
            Costo,
            Estado
        });

        res.json({
            mensaje: 'Transporte actualizado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar transporte',
            error: error.message
        });
    }
}

static async listarTodosTransportes(req, res) {
    try {
        const transportes = await Transporte.obtenerTodos();

        res.json({
            total: transportes.length,
            transportes
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener transportes',
            error: error.message
        });
    }
}

static async obtenerTransportePorId(req, res) {
    try {
        const { id } = req.params;

        const transporte = await Transporte.obtenerPorId(id);

        if (!transporte) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        res.json(transporte);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener transporte',
            error: error.message
        });
    }
}

static async eliminarTransporte(req, res) {
    try {
        const { id } = req.params;

        const transporte = await Transporte.obtenerPorId(id);

        if (!transporte) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        await Transporte.eliminarTransporte(id);

        res.json({
            mensaje: 'Transporte enviado a inactivo correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar transporte',
            error: error.message
        });
    }
}

static async ponerEnMantenimientoTransporte(req, res) {
    try {
        const { id } = req.params;

        const transporte = await Transporte.obtenerPorId(id);

        if (!transporte) {
            return res.status(404).json({
                mensaje: 'Transporte no encontrado'
            });
        }

        if (transporte.Estado === 'mantenimiento') {
            return res.status(400).json({
                mensaje: 'El transporte ya está en mantenimiento'
            });
        }

        const resultado = await Transporte.ponerEnMantenimiento(id);

        if (resultado.affectedRows === 0) {
            return res.status(400).json({
                mensaje: 'No se pudo enviar el transporte a mantenimiento'
            });
        }

        res.json({
            mensaje: 'Transporte enviado a mantenimiento correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al enviar transporte a mantenimiento',
            error: error.message
        });
    }
}

}

module.exports = TransporteController;
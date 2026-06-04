const Viaje = require('../models/Viaje.model');

class ViajeController {
    static async listarViajesRecientes(req, res) {
        try {
            const viajes = await Viaje.find()
                .sort({ V_Fecha: -1 }) 
                .limit(100);

            res.json(viajes);

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener viajes recientes',
                error: error.message
            });
        }
    }

    static async listarViajesPorUsuario(req, res) {
        try {
            const { idUsuario } = req.params;
            const { limite = 50 } = req.query;

            const viajes = await Viaje.find({ ID_Usuario: Number(idUsuario) })
                .sort({ V_Fecha: -1 })
                .limit(Number(limite));

            res.json({
                ID_Usuario: Number(idUsuario),
                total: viajes.length,
                viajes
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener viajes por usuario',
                error: error.message
            });
        }
    }

    static async listarViajesPorTransporte(req, res) {
        try {
            const { idTransporte } = req.params;
            const { limite = 50 } = req.query;

            const viajes = await Viaje.find({
                ID_Transporte: Number(idTransporte)
            })
            .sort({ V_Fecha: -1 })
            .limit(Number(limite));

            res.json({
                ID_Transporte: Number(idTransporte),
                total: viajes.length,
                viajes
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener viajes por transporte',
                error: error.message
            });
        }
    }

    static async listarViajesPorTransporteYFechas(req, res) {
        try {
            const { idTransporte } = req.params;
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    mensaje: 'fechaInicio y fechaFin son obligatorias'
                });
            }

            const inicio = new Date(`${fechaInicio}T00:00:00.000Z`);
            const fin = new Date(`${fechaFin}T23:59:59.999Z`);

            const viajes = await Viaje.find({
                ID_Transporte: Number(idTransporte),
                V_Fecha: {
                    $gte: inicio,
                    $lte: fin
                }
            }).sort({ V_Fecha: -1 });

            res.json({
                ID_Transporte: Number(idTransporte),
                fechaInicio,
                fechaFin,
                total: viajes.length,
                viajes
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener viajes por transporte y rango de fechas',
                error: error.message
            });
        }
    }

    static async listarViajes(req, res) {
    try {
        const viajes = await Viaje.find().sort({ V_Fecha: -1 });
        res.json(viajes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener viajes',
            error: error.message
        });
    }
}

    static async crearViaje(req, res) {
    try {
        const {
            ID_Usuario,
            ID_Transporte,
            V_Fecha,
            Costo_Cobrado,
            Estado,
            metadata
        } = req.body;

        if (!ID_Transporte || !Costo_Cobrado) {
            return res.status(400).json({
                mensaje: 'ID_Transporte y Costo_Cobrado son obligatorios'
            });
        }

        const rol = req.user?.rol || req.user?.Rol;

        const idUsuarioFinal = rol === 'usuario'
            ? Number(req.user.id)
            : Number(ID_Usuario);

        if (!idUsuarioFinal) {
            return res.status(400).json({
                mensaje: 'ID_Usuario es obligatorio para trabajadores o administradores'
            });
        }

        const nuevoViaje = new Viaje({
            ID_Usuario: idUsuarioFinal,
            ID_Transporte: Number(ID_Transporte),
            V_Fecha: V_Fecha ? new Date(V_Fecha) : new Date(),
            Costo_Cobrado: Number(Costo_Cobrado),
            Estado: Estado || 'completado',
            metadata: metadata || {}
        });

        const viajeGuardado = await nuevoViaje.save();

        res.status(201).json({
            mensaje: 'Viaje creado correctamente',
            viaje: viajeGuardado
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear viaje',
            error: error.message
        });
    }
}

static async listarMisViajes(req, res) {
    try {
        const idUsuario = Number(req.user.id);
        const limite = Number(req.query.limite) || 50;

        const viajes = await Viaje.aggregate([
            {
                $match: {
                    ID_Usuario: idUsuario
                }
            },
            {
                $sort: {
                    V_Fecha: -1
                }
            },
            {
                $limit: limite
            },
            {
                $lookup: {
                    from: 'pagos',
                    localField: '_id',
                    foreignField: 'ID_Viaje',
                    as: 'pago'
                }
            },
            {
                $unwind: {
                    path: '$pago',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    ID_Viaje: 1,
                    ID_Usuario: 1,
                    ID_Transporte: 1,
                    V_Fecha: 1,
                    Costo_Cobrado: 1,
                    Estado: 1,
                    metadata: 1,
                    pago: {
                        _id: '$pago._id',
                        Id_Tarjeta: '$pago.Id_Tarjeta',
                        ID_Viaje_Numero: '$pago.ID_Viaje_Numero',
                        Descripcion: '$pago.Descripcion',
                        Monto: '$pago.Monto',
                        Saldo_Antes: '$pago.Saldo_Antes',
                        Saldo_Despues: '$pago.Saldo_Despues',
                        FechaPago: '$pago.FechaPago'
                    }
            }
            }
        ]);

        res.json({
            ID_Usuario: idUsuario,
            total: viajes.length,
            viajes
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener mis viajes',
            error: error.message
        });
    }
}

}

module.exports = ViajeController;
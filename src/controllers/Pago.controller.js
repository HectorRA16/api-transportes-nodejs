const Tarjeta = require('../models/Tarjeta.model');
const Transporte = require('../models/Transporte.model');
const Viaje = require('../models/Viaje.model');
const Pago = require('../models/Pago.model');

class PagoController {
    static async obtenerHistorialPorTarjeta(req, res) {
        try {
            const { idTarjeta } = req.params;

            const pagos = await Pago.find({
                Id_Tarjeta: Number(idTarjeta)
            }).sort({ FechaPago: -1 });

            res.json(pagos);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener historial de cobros',
                error: error.message
            });
        }
    }

    static async obtenerCobrosPorTransporte(req, res) {
        try {
            const { idTransporte } = req.params;

            const cobros = await Pago.aggregate([
                {
                    $lookup: {
                        from: 'viajes',
                        localField: 'ID_Viaje',
                        foreignField: '_id',
                        as: 'viaje'
                    }
                },
                {
                    $unwind: '$viaje'
                },
                {
                    $match: {
                        'viaje.ID_Transporte': Number(idTransporte)
                    }
                },
                {
                    $sort: {
                        FechaPago: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        Id_Tarjeta: 1,
                        ID_Viaje: 1,
                        Descripcion: 1,
                        Monto: 1,
                        Saldo_Antes: 1,
                        Saldo_Despues: 1,
                        FechaPago: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        viaje: {
                            _id: '$viaje._id',
                            ID_Usuario: '$viaje.ID_Usuario',
                            ID_Transporte: '$viaje.ID_Transporte',
                            V_Fecha: '$viaje.V_Fecha',
                            Costo_Cobrado: '$viaje.Costo_Cobrado',
                            Estado: '$viaje.Estado',
                            metadata: '$viaje.metadata'
                        }
                    }
                }
            ]);

            if (cobros.length === 0) {
                return res.status(404).json({
                    mensaje: 'No se encontraron cobros para este transporte'
                });
            }

            res.json(cobros);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener cobros por transporte',
                error: error.message
            });
        }
    }

    static async cobrarViajeConNFC(req, res) {
        try {
            const {
                NFC_ID,
                ID_Transporte,
                parada_inicio,
                parada_fin,
                duracion_min
            } = req.body;

            if (!NFC_ID || !ID_Transporte) {
                return res.status(400).json({
                    mensaje: 'NFC_ID e ID_Transporte son obligatorios'
                });
            }

            const tarjeta = await Tarjeta.buscarPorNFC(NFC_ID);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            if (tarjeta.Estado !== 'activa') {
                return res.status(400).json({
                    mensaje: 'La tarjeta no está activa'
                });
            }

            const transporte = await Transporte.obtenerPorId(ID_Transporte);

            if (!transporte) {
                return res.status(404).json({
                    mensaje: 'Transporte no encontrado'
                });
            }

            if (transporte.Estado !== 'activo') {
                return res.status(400).json({
                    mensaje: 'El transporte no está activo'
                });
            }

            const costoViaje = Number(transporte.Costo);
            const saldoAntes = Number(tarjeta.Saldo);

            if (saldoAntes < costoViaje) {
                return res.status(400).json({
                    mensaje: 'Saldo insuficiente',
                    saldoActual: saldoAntes,
                    costoViaje
                });
            }

            const saldoDespues = saldoAntes - costoViaje;

            const viaje = await Viaje.create({
                ID_Usuario: tarjeta.ID_Usuario,
                ID_Transporte: Number(ID_Transporte),
                V_Fecha: new Date(),
                Costo_Cobrado: costoViaje,
                Estado: 'completado',
                metadata: {
                    parada_inicio: parada_inicio || '',
                    parada_fin: parada_fin || '',
                    duracion_min: duracion_min || 0
                }
            });

            await Tarjeta.actualizarSaldo(tarjeta.Id_Tarjeta, saldoDespues);

            const pago = await Pago.create({
                Id_Tarjeta: tarjeta.Id_Tarjeta,
                ID_Viaje: viaje._id,
                Descripcion: `Cobro de viaje en transporte ${ID_Transporte}`,
                Monto: costoViaje,
                Saldo_Antes: saldoAntes,
                Saldo_Despues: saldoDespues,
                FechaPago: new Date()
            });

            res.status(201).json({
                mensaje: 'Viaje cobrado correctamente',
                tarjeta: {
                    Id_Tarjeta: tarjeta.Id_Tarjeta,
                    NFC_ID: tarjeta.NFC_ID,
                    saldoAnterior: saldoAntes,
                    saldoActual: saldoDespues
                },
                viaje,
                pago
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al cobrar viaje con tarjeta NFC',
                error: error.message
            });
        }
    }

    
}

module.exports = PagoController;
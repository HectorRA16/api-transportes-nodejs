const { pool } = require('../config/mysql');
const Viaje = require('../models/Viaje.model');
const Pago = require('../models/Pago.model');

class ReporteController {
    static async recargasPorDia(req, res) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    DATE(FechaRecarga) AS Fecha,
                    COUNT(*) AS TotalRecargas,
                    SUM(Monto) AS TotalRecargado
                FROM Recarga
                GROUP BY DATE(FechaRecarga)
                ORDER BY Fecha DESC`
            );

            res.json({
                totalDias: rows.length,
                reporte: rows
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener reporte de recargas por día',
                error: error.message
            });
        }
    }

    static async tarjetasPorEstado(req, res) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    Estado,
                    COUNT(*) AS TotalTarjetas
                FROM Tarjeta
                GROUP BY Estado
                ORDER BY Estado`
            );

            res.json({
                totalEstados: rows.length,
                reporte: rows
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener reporte de tarjetas por estado',
                error: error.message
            });
        }
    }

    static async pagosPorDia(req, res) {
        try {
            const pagos = await Pago.aggregate([
                {
                    $group: {
                        _id: {
                            anio: { $year: '$FechaPago' },
                            mes: { $month: '$FechaPago' },
                            dia: { $dayOfMonth: '$FechaPago' }
                        },
                        TotalPagos: { $sum: 1 },
                        TotalCobrado: { $sum: '$Monto' }
                    }
                },
                {
                    $sort: {
                        '_id.anio': -1,
                        '_id.mes': -1,
                        '_id.dia': -1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Fecha: {
                            $concat: [
                                { $toString: '$_id.anio' },
                                '-',
                                { $toString: '$_id.mes' },
                                '-',
                                { $toString: '$_id.dia' }
                            ]
                        },
                        TotalPagos: 1,
                        TotalCobrado: 1
                    }
                }
            ]);

            res.json({
                totalDias: pagos.length,
                reporte: pagos
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener reporte de pagos por día',
                error: error.message
            });
        }
    }

    static async viajesPorDia(req, res) {
        try {
            const viajes = await Viaje.aggregate([
                {
                    $group: {
                        _id: {
                            anio: { $year: '$V_Fecha' },
                            mes: { $month: '$V_Fecha' },
                            dia: { $dayOfMonth: '$V_Fecha' }
                        },
                        TotalViajes: { $sum: 1 },
                        TotalCobrado: { $sum: '$Costo_Cobrado' }
                    }
                },
                {
                    $sort: {
                        '_id.anio': -1,
                        '_id.mes': -1,
                        '_id.dia': -1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Fecha: {
                            $concat: [
                                { $toString: '$_id.anio' },
                                '-',
                                { $toString: '$_id.mes' },
                                '-',
                                { $toString: '$_id.dia' }
                            ]
                        },
                        TotalViajes: 1,
                        TotalCobrado: 1
                    }
                }
            ]);

            res.json({
                totalDias: viajes.length,
                reporte: viajes
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener reporte de viajes por día',
                error: error.message
            });
        }
    }

    static async transportesMasUsados(req, res) {
        try {
            const viajes = await Viaje.aggregate([
                {
                    $group: {
                        _id: '$ID_Transporte',
                        TotalViajes: { $sum: 1 },
                        TotalCobrado: { $sum: '$Costo_Cobrado' }
                    }
                },
                {
                    $sort: {
                        TotalViajes: -1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        ID_Transporte: '$_id',
                        TotalViajes: 1,
                        TotalCobrado: 1
                    }
                }
            ]);

            res.json({
                totalTransportes: viajes.length,
                reporte: viajes
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener transportes más usados',
                error: error.message
            });
        }
    }

    static async resumenGeneral(req, res) {
        try {
            const [[usuarios]] = await pool.query(
                `SELECT COUNT(*) AS TotalUsuarios FROM Usuario`
            );

            const [[tarjetas]] = await pool.query(
                `SELECT COUNT(*) AS TotalTarjetas FROM Tarjeta`
            );

            const [[transportes]] = await pool.query(
                `SELECT COUNT(*) AS TotalTransportes FROM Transporte`
            );

            const [[recargas]] = await pool.query(
                `SELECT 
                    COUNT(*) AS TotalRecargas,
                    IFNULL(SUM(Monto), 0) AS TotalRecargado
                FROM Recarga`
            );

            const totalViajes = await Viaje.countDocuments();
            const totalPagos = await Pago.countDocuments();

            const pagosMongo = await Pago.aggregate([
                {
                    $group: {
                        _id: null,
                        TotalCobrado: { $sum: '$Monto' }
                    }
                }
            ]);

            const totalCobrado = pagosMongo.length > 0 ? pagosMongo[0].TotalCobrado : 0;

            res.json({
                usuarios: usuarios.TotalUsuarios,
                tarjetas: tarjetas.TotalTarjetas,
                transportes: transportes.TotalTransportes,
                recargas: {
                    total: recargas.TotalRecargas,
                    dineroRecargado: recargas.TotalRecargado
                },
                viajes: totalViajes,
                pagos: {
                    total: totalPagos,
                    dineroCobrado: totalCobrado
                }
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener resumen general',
                error: error.message
            });
        }
    }
}

module.exports = ReporteController;
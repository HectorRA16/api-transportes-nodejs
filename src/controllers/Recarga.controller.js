const Tarjeta = require('../models/Tarjeta.model');
const Recarga = require('../models/Recarga.model');

class RecargaController {
    static async recargarSaldo(req, res) {
        try {
            const { Id_Tarjeta, Monto, Metodo } = req.body;

            if (!Id_Tarjeta || !Monto || !Metodo) {
                return res.status(400).json({
                    mensaje: 'Id_Tarjeta, Monto y Metodo son obligatorios'
                });
            }

            if (Monto <= 0) {
                return res.status(400).json({
                    mensaje: 'El monto debe ser mayor a 0'
                });
            }

            const metodosValidos = ['efectivo', 'transferencia', 'terminal'];

            if (!metodosValidos.includes(Metodo)) {
                return res.status(400).json({
                    mensaje: 'Método de pago inválido'
                });
            }

            const tarjeta = await Tarjeta.obtenerPorId(Id_Tarjeta);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            if (Number(tarjeta.ID_Usuario) !== Number(req.user.id)) {
                return res.status(403).json({
                    mensaje: 'No puedes recargar una tarjeta que no te pertenece'
            });
            }

            if (tarjeta.Estado !== 'activa') {
                return res.status(400).json({
                    mensaje: 'La tarjeta no está activa'
                });
            }
            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            const saldoAnterior = Number(tarjeta.Saldo);
            const saldoNuevo = saldoAnterior + Number(Monto);

            // actualizar saldo
            await Tarjeta.actualizarSaldo(Id_Tarjeta, saldoNuevo);

            // registrar recarga
            const recarga = await Recarga.registrarRecarga({
                Id_Tarjeta,
                Monto,
                Metodo
            });

            res.status(201).json({
                mensaje: 'Recarga realizada correctamente',
                tarjeta: {
                    Id_Tarjeta,
                    saldoAnterior,
                    saldoActual: saldoNuevo
                },
                recargaId: recarga.insertId
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al recargar saldo',
                error: error.message
            });
        }
    }

    static async obtenerHistorialPorTarjeta(req, res) {
        try {
            const { idTarjeta } = req.params;

            const tarjeta = await Tarjeta.obtenerPorId(idTarjeta);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            if (Number(tarjeta.ID_Usuario) !== Number(req.user.id)) {
                return res.status(403).json({
                    mensaje: 'No puedes consultar una tarjeta que no te pertenece'
                });
            }

            const historial = await Recarga.obtenerHistorialPorTarjeta(idTarjeta);

            res.json({
                Id_Tarjeta: Number(idTarjeta),
                historial
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener historial de recargas',
                error: error.message
            });
        }
    }
}

module.exports = RecargaController;
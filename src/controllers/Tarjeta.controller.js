const Tarjeta = require('../models/Tarjeta.model');

class TarjetaController {
    static async cambiarEstadoTarjeta(req, res) {
        try {
            const { id } = req.params;
            const { Estado } = req.body;

            if (!Estado) {
                return res.status(400).json({
                    mensaje: 'El estado es obligatorio'
                });
            }

            const estadosValidos = ['activa', 'bloqueada', 'vencida'];

            if (!estadosValidos.includes(Estado)) {
                return res.status(400).json({
                    mensaje: 'Estado inválido'
                });
            }

            const tarjeta = await Tarjeta.obtenerPorId(id);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            if (tarjeta.Estado === Estado) {
                return res.status(400).json({
                    mensaje: `La tarjeta ya está en estado ${Estado}`
                });
            }

            await Tarjeta.cambiarEstado(id, Estado);

            res.json({
                mensaje: 'Estado de la tarjeta actualizado correctamente'
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al cambiar estado de la tarjeta',
                error: error.message
            });
        }
    }

    static async buscarTarjetaPorNFC(req, res) {
        try {
            const { nfcId } = req.params;

            const tarjeta = await Tarjeta.buscarPorNFC(nfcId);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            res.json(tarjeta);

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al buscar tarjeta por NFC_ID',
                error: error.message
            });
        }
    }

    static async consultarSaldoPorNFC(req, res) {
        try {
            const { nfcId } = req.params;

            const tarjeta = await Tarjeta.buscarPorNFC(nfcId);

            if (!tarjeta) {
                return res.status(404).json({
                    mensaje: 'Tarjeta no encontrada'
                });
            }

            res.json({
                Id_Tarjeta: tarjeta.Id_Tarjeta,
                NFC_ID: tarjeta.NFC_ID,
                Saldo: tarjeta.Saldo,
                Estado: tarjeta.Estado
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al consultar saldo por NFC',
                error: error.message
            });
        }
    }

    static async crearTarjeta(req, res) {
    try {
        const { Num_Tarjeta, NFC_ID, Saldo = 0, Estado = 'activa' } = req.body;
        const ID_Usuario = req.user.id;

        if (!Num_Tarjeta || !NFC_ID) {
            return res.status(400).json({
                mensaje: 'Num_Tarjeta y NFC_ID son obligatorios'
            });
        }

        if (Number(Saldo) < 0) {
            return res.status(400).json({
                mensaje: 'El saldo no puede ser negativo'
            });
        }

        const estadosValidos = ['activa', 'bloqueada', 'vencida'];

        if (!estadosValidos.includes(Estado)) {
            return res.status(400).json({
                mensaje: 'Estado inválido'
            });
        }

        const tarjetaPorNumero = await Tarjeta.buscarPorNumero(Num_Tarjeta);

        if (tarjetaPorNumero) {
            return res.status(400).json({
                mensaje: 'El número de tarjeta ya está registrado'
            });
        }

        const tarjetaPorNFC = await Tarjeta.buscarPorNFC(NFC_ID);

        if (tarjetaPorNFC) {
            return res.status(400).json({
                mensaje: 'El NFC_ID ya está registrado'
            });
        }

        const resultado = await Tarjeta.crearTarjeta({
            Num_Tarjeta,
            NFC_ID,
            Saldo: Number(Saldo),
            Estado,
            ID_Usuario
        });

        res.status(201).json({
            mensaje: 'Tarjeta creada correctamente',
            Id_Tarjeta: resultado.insertId,
            ID_Usuario
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear tarjeta',
            error: error.message
        });
    }
}

static async listarMisTarjetas(req, res) {
    try {
        const tarjetas = await Tarjeta.obtenerPorUsuario(req.user.id);

        res.json({
            ID_Usuario: req.user.id,
            total: tarjetas.length,
            tarjetas
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener tarjetas del usuario',
            error: error.message
        });
    }
}

static async bloquearTarjeta(req, res) {
    try {
        const { id } = req.params;

        const tarjeta = await Tarjeta.obtenerPorId(id);

        if (!tarjeta) {
            return res.status(404).json({
                mensaje: 'Tarjeta no encontrada'
            });
        }

        const rol = req.user.rol || req.user.Rol;

        if (rol !== 'admin' && Number(tarjeta.ID_Usuario) !== Number(req.user.id)) {
            return res.status(403).json({
                mensaje: 'No puedes bloquear una tarjeta que no te pertenece'
            });
        }

        if (tarjeta.Estado === 'bloqueada') {
            return res.status(400).json({
                mensaje: 'La tarjeta ya está bloqueada'
            });
        }

        await Tarjeta.cambiarEstado(id, 'bloqueada');

        res.json({
            mensaje: 'Tarjeta bloqueada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al bloquear tarjeta',
            error: error.message
        });
    }
}

static async desbloquearTarjeta(req, res) {
    try {
        const { id } = req.params;

        const tarjeta = await Tarjeta.obtenerPorId(id);

        if (!tarjeta) {
            return res.status(404).json({
                mensaje: 'Tarjeta no encontrada'
            });
        }

        const rol = req.user.rol || req.user.Rol;

        if (rol !== 'admin' && Number(tarjeta.ID_Usuario) !== Number(req.user.id)) {
            return res.status(403).json({
                mensaje: 'No puedes desbloquear una tarjeta que no te pertenece'
            });
        }

        if (tarjeta.Estado === 'activa') {
            return res.status(400).json({
                mensaje: 'La tarjeta ya está activa'
            });
        }

        if (tarjeta.Estado === 'vencida') {
            return res.status(400).json({
                mensaje: 'No se puede desbloquear una tarjeta vencida'
            });
        }

        await Tarjeta.cambiarEstado(id, 'activa');

        res.json({
            mensaje: 'Tarjeta desbloqueada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al desbloquear tarjeta',
            error: error.message
        });
    }
}

}

module.exports = TarjetaController;
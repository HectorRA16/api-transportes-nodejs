const Manejo = require('../models/Manejo.model');

class ManejoController {
    static async asignarTransporte(req, res) {
        try {
            const { ID_Trabajador, ID_Transporte, FechaAsignacion } = req.body;

            if (!ID_Trabajador || !ID_Transporte || !FechaAsignacion) {
                return res.status(400).json({
                    mensaje: 'ID_Trabajador, ID_Transporte y FechaAsignacion son obligatorios'
                });
            }

            const existe = await Manejo.verificarAsignacion(ID_Trabajador, ID_Transporte);

            if (existe) {
                return res.status(400).json({
                    mensaje: 'Ese transporte ya está asignado a ese trabajador'
                });
            }

            const resultado = await Manejo.asignarTransporte({
                ID_Trabajador,
                ID_Transporte,
                FechaAsignacion
            });

            res.status(201).json({
                mensaje: 'Transporte asignado correctamente',
                resultado
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al asignar transporte',
                error: error.message
            });
        }
    }
    
    static async quitarTrabajadorDeTransporte(req, res) {
    try {
        const { ID_Trabajador, ID_Transporte } = req.body;

        if (!ID_Trabajador || !ID_Transporte) {
            return res.status(400).json({
                mensaje: 'ID_Trabajador e ID_Transporte son obligatorios'
            });
        }

        const existe = await Manejo.verificarAsignacion(ID_Trabajador, ID_Transporte);

        if (!existe) {
            return res.status(404).json({
                mensaje: 'La asignación no existe'
            });
        }

        const resultado = await Manejo.quitarTrabajadorDeTransporte(
            ID_Trabajador,
            ID_Transporte
        );

        res.json({
            mensaje: 'Trabajador quitado del transporte correctamente',
            resultado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al quitar trabajador del transporte',
            error: error.message
        });
    }
}
}

module.exports = ManejoController;
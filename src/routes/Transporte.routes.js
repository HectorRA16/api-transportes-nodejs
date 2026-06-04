const express = require('express');
const router = express.Router();
const TransporteController = require('../controllers/Transporte.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.post('/', verificarToken, soloTrabajador, TransporteController.crearTransporte);
router.get('/', verificarToken, soloTrabajador, TransporteController.listarTodosTransportes);
router.get('/activos', verificarToken, soloTrabajador, TransporteController.listarTransportesActivos);
router.get('/:id', verificarToken, soloTrabajador, TransporteController.obtenerTransportePorId);
router.put('/:id', verificarToken, soloTrabajador, TransporteController.actualizarTransporte);
router.put('/:id/baja', verificarToken, soloTrabajador, TransporteController.darDeBajaTransporte);
router.put('/:id/alta', verificarToken, soloTrabajador, TransporteController.darDeAltaTransporte);
router.put('/:id/mantenimiento', verificarToken, soloTrabajador, TransporteController.ponerEnMantenimientoTransporte);
router.get('/:id/trabajador-actual', verificarToken, soloTrabajador, TransporteController.obtenerTransporteConTrabajadorActual);

module.exports = router;
const express = require('express');
const router = express.Router();
const TrabajadorController = require('../controllers/Trabajador.controller');

const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.post('/', TrabajadorController.registrarTrabajador);
router.get('/:id', verificarToken, soloTrabajador, TrabajadorController.obtenerTrabajadorPorId);
router.get('/:id/transportes', verificarToken, soloTrabajador, TrabajadorController.obtenerTrabajadorConTransportes);
router.put('/:id/desactivar', verificarToken, soloTrabajador, TrabajadorController.desactivarTrabajador);
router.put('/:id/activar', verificarToken, soloTrabajador, TrabajadorController.activarTrabajador);

module.exports = router;
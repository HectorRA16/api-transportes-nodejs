const express = require('express');
const router = express.Router();
const TrabajadorController = require('../controllers/Trabajador.controller');

const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');
const soloAdmin = require('../middlewares/soloAdmin');

router.post('/', verificarToken, soloAdmin, TrabajadorController.registrarTrabajador);
router.get('/transportes/asignados', verificarToken, soloAdmin, TrabajadorController.obtenerTodosConTransportes);
router.get('/:id', verificarToken, soloTrabajador, TrabajadorController.obtenerTrabajadorPorId);
router.get('/:id/transportes', verificarToken, soloTrabajador, TrabajadorController.obtenerTrabajadorConTransportes);
router.put('/:id/desactivar', verificarToken, soloAdmin, TrabajadorController.desactivarTrabajador);
router.put('/:id/activar', verificarToken, soloAdmin, TrabajadorController.activarTrabajador);
router.put('/:id', verificarToken, soloAdmin, TrabajadorController.actualizarTrabajador);

module.exports = router;
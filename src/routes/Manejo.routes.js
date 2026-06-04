const express = require('express');
const router = express.Router();
const ManejoController = require('../controllers/Manejo.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.post('/asignar', verificarToken, soloTrabajador, ManejoController.asignarTransporte);
router.delete('/quitar', verificarToken, soloTrabajador, ManejoController.quitarTrabajadorDeTransporte);

module.exports = router;
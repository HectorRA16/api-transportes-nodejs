const express = require('express');
const router = express.Router();
const ViajeController = require('../controllers/Viaje.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');
const soloUsuario = require('../middlewares/soloUsuario');


router.get('/mis-viajes', verificarToken, soloUsuario, ViajeController.listarMisViajes);
router.get('/', verificarToken, ViajeController.listarViajes);
router.post('/', verificarToken, ViajeController.crearViaje);
router.get('/recientes', verificarToken, ViajeController.listarViajesRecientes);
router.get('/usuario/:idUsuario', verificarToken, ViajeController.listarViajesPorUsuario);
router.get('/transporte/:idTransporte', verificarToken, soloTrabajador, ViajeController.listarViajesPorTransporte);
router.get('/transporte/:idTransporte/fechas', verificarToken, soloTrabajador, ViajeController.listarViajesPorTransporteYFechas);
router.get('/mis-recientes', verificarToken, soloUsuario, ViajeController.listarMisViajesRecientes);

module.exports = router;
const express = require('express');
const router = express.Router();
const PagoController = require('../controllers/Pago.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.post('/cobrar', verificarToken, soloTrabajador, PagoController.cobrarViajeConNFC);
router.get('/tarjeta/:idTarjeta', verificarToken, soloTrabajador, PagoController.obtenerHistorialPorTarjeta);
router.get('/transporte/:idTransporte', verificarToken, soloTrabajador, PagoController.obtenerCobrosPorTransporte);

module.exports = router;
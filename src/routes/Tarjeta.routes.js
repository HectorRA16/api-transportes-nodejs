const express = require('express');
const router = express.Router();
const TarjetaController = require('../controllers/Tarjeta.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloUsuario = require('../middlewares/soloUsuario');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.post('/', verificarToken, soloUsuario, TarjetaController.crearTarjeta);
router.get('/mis-tarjetas', verificarToken, soloUsuario, TarjetaController.listarMisTarjetas);
router.get('/nfc/:nfcId', verificarToken, soloTrabajador, TarjetaController.buscarTarjetaPorNFC);
router.get('/nfc/:nfcId/saldo', verificarToken, soloUsuario, TarjetaController.consultarSaldoPorNFC);
router.put('/:id/estado', verificarToken, soloTrabajador, TarjetaController.cambiarEstadoTarjeta);
router.put('/:id/bloquear', verificarToken,  TarjetaController.bloquearTarjeta);
router.put('/:id/desbloquear', verificarToken, TarjetaController.desbloquearTarjeta);

module.exports = router;
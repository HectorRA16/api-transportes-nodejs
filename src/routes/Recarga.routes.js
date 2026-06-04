const express = require('express');
const router = express.Router();
const RecargaController = require('../controllers/Recarga.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloUsuario = require('../middlewares/soloUsuario');

router.post('/', verificarToken, soloUsuario, RecargaController.recargarSaldo);
router.get('/tarjeta/:idTarjeta', verificarToken, soloUsuario, RecargaController.obtenerHistorialPorTarjeta);;

module.exports = router;
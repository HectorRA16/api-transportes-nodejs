const express = require('express');
const router = express.Router();

const ManejoController = require('../controllers/Manejo.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloAdminOTrabajador = require('../middlewares/soloAdminOTrabajador');

router.post('/asignar', verificarToken, soloAdminOTrabajador, ManejoController.asignarTransporte);
router.delete('/quitar', verificarToken, soloAdminOTrabajador, ManejoController.quitarTransporte);

module.exports = router;
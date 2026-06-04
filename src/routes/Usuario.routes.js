const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/Usuario.controller');

const verificarToken = require('../middlewares/verificarToken');
const soloAdmin = require('../middlewares/soloAdmin');
const soloAdminOPropietario = require('../middlewares/soloAdminOPropietario');

router.post('/', UsuarioController.crearUsuario);
router.get('/:id', verificarToken, soloAdminOPropietario, UsuarioController.obtenerUsuarioPorId);
router.put('/:id', verificarToken, soloAdminOPropietario, UsuarioController.actualizarUsuario);
router.put('/:id/desactivar', verificarToken, soloAdmin, UsuarioController.desactivarUsuario);
router.put('/:id/activar', verificarToken, soloAdmin, UsuarioController.activarUsuario);

module.exports = router;
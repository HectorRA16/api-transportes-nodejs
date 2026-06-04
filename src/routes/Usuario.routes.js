const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/Usuario.controller');

const verificarToken = require('../middlewares/verificarToken');
const soloUsuario = require('../middlewares/soloUsuario');


router.post('/', UsuarioController.crearUsuario);
router.get('/:id', verificarToken, soloUsuario, UsuarioController.obtenerUsuarioPorId);
router.put('/:id', verificarToken, soloUsuario, UsuarioController.actualizarUsuario);
router.put('/:id/desactivar', verificarToken, soloUsuario, UsuarioController.desactivarUsuario);
router.put('/:id/activar', verificarToken, soloUsuario, UsuarioController.activarUsuario);

module.exports = router;
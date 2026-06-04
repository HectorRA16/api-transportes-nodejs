const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/login', AuthController.loginTrabajador);
router.post('/login-usuario', AuthController.loginUsuario);

module.exports = router;
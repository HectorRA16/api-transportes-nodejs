const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/Reporte.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloTrabajador = require('../middlewares/soloTrabajador');

router.get('/recargas-dia', verificarToken, soloTrabajador, ReporteController.recargasPorDia);
router.get('/tarjetas-estado', verificarToken, soloTrabajador, ReporteController.tarjetasPorEstado);
router.get('/pagos-dia', verificarToken, soloTrabajador, ReporteController.pagosPorDia);
router.get('/viajes-dia', verificarToken, soloTrabajador, ReporteController.viajesPorDia);
router.get('/transportes-mas-usados', verificarToken, soloTrabajador, ReporteController.transportesMasUsados);
router.get('/resumen-general', verificarToken, soloTrabajador, ReporteController.resumenGeneral);

module.exports = router;
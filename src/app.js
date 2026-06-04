const express = require('express');
const cors = require('cors');

const trabajadorRoutes = require('./routes/Trabajador.routes');
const authRoutes = require('./routes/auth.routes');
const manejoRoutes = require('./routes/Manejo.routes');
const pagoRoutes = require('./routes/Pago.routes');
const usuarioRoutes = require('./routes/Usuario.routes');
const transporteRoutes = require('./routes/Transporte.routes');
const tarjetaRoutes = require('./routes/Tarjeta.routes');
const recargaRoutes = require('./routes/Recarga.routes');
const viajesRoutes = require('./routes/Viajes.routes');
const reporteRoutes = require('./routes/Reporte.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/manejo', manejoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/transportes', transporteRoutes);
app.use('/api/tarjetas', tarjetaRoutes);
app.use('/api/recargas', recargaRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/reportes', reporteRoutes);


app.get('/', (req, res) => {
    res.json({
    mensaje: 'API de transporte funcionando correctamente'
    });
});

module.exports = app;
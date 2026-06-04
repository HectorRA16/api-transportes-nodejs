const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    Id_Tarjeta: {
        type: Number,
        required: true
    },
    ID_Viaje: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Viaje',
        required: true
    },
    ID_Viaje_Numero: {
        type: Number
    },
    Descripcion: {
        type: String,
        required: true
    },
    Monto: {
        type: Number,
        required: true
    },
    Saldo_Antes: {
        type: Number,
        required: true
    },
    Saldo_Despues: {
        type: Number,
        required: true
    },
    FechaPago: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'pagos'
});

module.exports = mongoose.model('Pago', pagoSchema);
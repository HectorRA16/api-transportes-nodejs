const mongoose = require('mongoose');

const viajeSchema = new mongoose.Schema({
    ID_Usuario: {
        type: Number,
        required: true
    },
    ID_Transporte: {
        type: Number,
        required: true
    },
    V_Fecha: {
        type: Date,
        default: Date.now
    },
    Costo_Cobrado: {
        type: Number,
        required: true
    },
    Estado: {
        type: String,
        enum: ['completado', 'cancelado'],
        default: 'completado'
    },
    metadata: {
        parada_inicio: {
            type: String,
            default: ''
        },
        parada_fin: {
            type: String,
            default: ''
        },
        duracion_min: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    collection: 'viajes'
});

module.exports = mongoose.model('Viaje', viajeSchema);
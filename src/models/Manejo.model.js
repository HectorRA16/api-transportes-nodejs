const { pool } = require('../config/mysql');

class Manejo {
    static async asignarTransporte(data) {
        const { ID_Trabajador, ID_Transporte, FechaAsignacion } = data;

        const [result] = await pool.query(
            `INSERT INTO manejo (ID_Trabajador, ID_Transporte, FechaAsignacion)
            VALUES (?, ?, ?)`,
            [ID_Trabajador, ID_Transporte, FechaAsignacion]
        );

        return result;
    }

    static async verificarAsignacion(ID_Trabajador, ID_Transporte) {
        const [rows] = await pool.query(
            `SELECT * FROM manejo
            WHERE ID_Trabajador = ? AND ID_Transporte = ?`,
            [ID_Trabajador, ID_Transporte]
        );

        return rows[0];
    }
    
    static async quitarTrabajadorDeTransporte(ID_Trabajador, ID_Transporte) {
    const [result] = await pool.query(
        `DELETE FROM manejo
        WHERE ID_Trabajador = ? AND ID_Transporte = ?`,
        [ID_Trabajador, ID_Transporte]
    );

    return result;
}
}

module.exports = Manejo;
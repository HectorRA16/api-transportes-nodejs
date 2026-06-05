const { pool } = require('../config/mysql');

class Recarga {
    static async registrarRecarga(data) {
        const { Id_Tarjeta, Monto, Metodo } = data;

        const [result] = await pool.query(
            `INSERT INTO recarga (Id_Tarjeta, Monto, FechaRecarga, Metodo)
            VALUES (?, ?, NOW(), ?)`,
            [Id_Tarjeta, Monto, Metodo]
        );

        return result;
    }

    static async obtenerHistorialPorTarjeta(idTarjeta) {
        const [rows] = await pool.query(
            `SELECT 
                ID_Recarga,
                Id_Tarjeta,
                Monto,
                FechaRecarga,
                Metodo
            FROM recarga
            WHERE Id_Tarjeta = ?
            ORDER BY FechaRecarga DESC`,
            [idTarjeta]
        );

        return rows;
    }

    static async obtenerPorTarjeta(idTarjeta) {
    const [rows] = await pool.query(
        `SELECT 
            ID_Recarga,
            Id_Tarjeta,
            Monto,
            FechaRecarga,
            Metodo
        FROM recarga
        WHERE Id_Tarjeta = ?
        ORDER BY FechaRecarga DESC`,
        [idTarjeta]
    );

    return rows;
}

}

module.exports = Recarga;
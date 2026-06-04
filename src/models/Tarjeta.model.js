const { pool } = require('../config/mysql');

class Tarjeta {

    static async crearTarjeta(data) {
    const { Num_Tarjeta, NFC_ID, Saldo, Estado, ID_Usuario } = data;

    const [result] = await pool.query(
        `INSERT INTO Tarjeta (Num_Tarjeta, NFC_ID, Saldo, Estado, ID_Usuario, FechaEmision)
        VALUES (?, ?, ?, ?, ?, CURDATE())`,
        [Num_Tarjeta, NFC_ID, Saldo, Estado, ID_Usuario]
    );

    return result;
}

static async buscarPorNumero(numTarjeta) {
    const [rows] = await pool.query(
        `SELECT * FROM Tarjeta WHERE Num_Tarjeta = ?`,
        [numTarjeta]
    );

    return rows[0];
}

static async obtenerPorUsuario(idUsuario) {
    const [rows] = await pool.query(
        `SELECT 
            Id_Tarjeta,
            Num_Tarjeta,
            NFC_ID,
            Saldo,
            Estado,
            ID_Usuario,
            FechaEmision
        FROM Tarjeta
        WHERE ID_Usuario = ?
        ORDER BY FechaEmision DESC`,
        [idUsuario]
    );

    return rows;
}

    static async buscarPorNFC(nfcId) {
        const [rows] = await pool.query(
            `SELECT 
                Id_Tarjeta,
                Num_Tarjeta,
                NFC_ID,
                Saldo,
                Estado,
                ID_Usuario,
                FechaEmision
            FROM Tarjeta
            WHERE NFC_ID = ?`,
            [nfcId]
        );

        return rows[0];
    }


    static async actualizarSaldo(idTarjeta, nuevoSaldo) {
    const [result] = await pool.query(
        `UPDATE Tarjeta
        SET Saldo = ?
        WHERE Id_Tarjeta = ?`,
        [nuevoSaldo, idTarjeta]
    );

    return result;
}

    static async obtenerPorId(idTarjeta) {
    const [rows] = await pool.query(
        `SELECT * FROM Tarjeta WHERE Id_Tarjeta = ?`,
        [idTarjeta]
    );

    return rows[0];
}

    static async cambiarEstado(idTarjeta, nuevoEstado) {
    const [result] = await pool.query(
        `UPDATE Tarjeta
        SET Estado = ?
        WHERE Id_Tarjeta = ?`,
        [nuevoEstado, idTarjeta]
    );

    return result;
}
}

module.exports = Tarjeta;
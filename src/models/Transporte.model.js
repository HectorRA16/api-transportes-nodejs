const { pool } = require('../config/mysql');

class Transporte {
    static async obtenerPorId(idTransporte) {
        const [rows] = await pool.query(
            `SELECT ID_Transporte, Placa, Capacidad, Costo, Estado
            FROM Transporte
            WHERE ID_Transporte = ?`,
            [idTransporte]
        );

        return rows[0];
    }

    static async buscarPorPlaca(placa) {
        const [rows] = await pool.query(
            `SELECT * FROM Transporte WHERE Placa = ?`,
            [placa]
        );

        return rows[0];
    }

    static async crearTransporte(data) {
        const { Placa, Capacidad, Costo, Estado } = data;

        const [result] = await pool.query(
            `INSERT INTO Transporte (Placa, Capacidad, Costo, Estado)
            VALUES (?, ?, ?, ?)`,
            [Placa, Capacidad, Costo, Estado]
        );

        return result;
    }
    static async obtenerActivos() {
    const [rows] = await pool.query(
        `SELECT 
            ID_Transporte,
            Placa,
            Capacidad,
            Costo,
            Estado
        FROM Transporte
        WHERE Estado = 'activo'`
    );

    return rows;
}
static async darDeBaja(idTransporte) {
    const [result] = await pool.query(
        `UPDATE Transporte
        SET Estado = 'inactivo'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}
static async darDeAlta(idTransporte) {
    const [result] = await pool.query(
        `UPDATE Transporte
        SET Estado = 'activo'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}
static async obtenerConTrabajadorActual(idTransporte) {
    const [rows] = await pool.query(
        `SELECT 
            tr.ID_Transporte,
            tr.Placa,
            tr.Capacidad,
            tr.Costo,
            tr.Estado,
            tb.ID_Trabajador,
            tb.Nombre,
            tb.Cedula,
            tb.FechaContratacion,
            tb.is_active,
            m.FechaAsignacion
        FROM Transporte tr
        LEFT JOIN Manejo m
            ON tr.ID_Transporte = m.ID_Transporte
        LEFT JOIN Trabajador tb
            ON m.ID_Trabajador = tb.ID_Trabajador
        WHERE tr.ID_Transporte = ?
        ORDER BY m.FechaAsignacion DESC
        LIMIT 1`,
        [idTransporte]
    );

    return rows[0];
}
static async actualizarTransporte(idTransporte, data) {
    const { Placa, Capacidad, Costo, Estado } = data;

    const [result] = await pool.query(
        `UPDATE Transporte
        SET Placa = ?, Capacidad = ?, Costo = ?, Estado = ?
        WHERE ID_Transporte = ?`,
        [Placa, Capacidad, Costo, Estado, idTransporte]
    );

    return result;
}

static async obtenerTodos() {
    const [rows] = await pool.query(
        `SELECT 
            ID_Transporte,
            Placa,
            Capacidad,
            Costo,
            Estado
        FROM Transporte
        ORDER BY ID_Transporte DESC`
    );

    return rows;
}

static async eliminarTransporte(idTransporte) {
    const [result] = await pool.query(
        `UPDATE Transporte
        SET Estado = 'inactivo'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}

static async ponerEnMantenimiento(idTransporte) {
    const [result] = await pool.query(
        `UPDATE Transporte
        SET Estado = 'mantenimiento'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}

static async buscarPlacaEnOtroTransporte(placa, idTransporte) {
    const [rows] = await pool.query(
        `SELECT *
        FROM Transporte
        WHERE Placa = ?
        AND ID_Transporte <> ?`,
        [placa, idTransporte]
    );

    return rows[0];
}

}

module.exports = Transporte;
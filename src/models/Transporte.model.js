const { pool } = require('../config/mysql');

class Transporte {
    static async obtenerPorId(idTransporte) {
        const [rows] = await pool.query(
            `SELECT ID_Transporte, Placa, Capacidad, Costo, Estado
            FROM transporte
            WHERE ID_Transporte = ?`,
            [idTransporte]
        );

        return rows[0];
    }

    static async buscarPorPlaca(placa) {
        const [rows] = await pool.query(
            `SELECT * FROM transporte WHERE Placa = ?`,
            [placa]
        );

        return rows[0];
    }

    static async crearTransporte(data) {
        const { Placa, Capacidad, Costo, Estado } = data;

        const [result] = await pool.query(
            `INSERT INTO transporte (Placa, Capacidad, Costo, Estado)
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
        FROM transporte
        WHERE Estado = 'activo'`
    );

    return rows;
}
static async darDeBaja(idTransporte) {
    const [result] = await pool.query(
        `UPDATE transporte
        SET Estado = 'inactivo'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}
static async darDeAlta(idTransporte) {
    const [result] = await pool.query(
        `UPDATE transporte
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
        FROM transporte tr
        LEFT JOIN manejo m
            ON tr.ID_Transporte = m.ID_Transporte
        LEFT JOIN trabajador tb
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
        `UPDATE transporte
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
        FROM transporte
        ORDER BY ID_Transporte DESC`
    );

    return rows;
}

static async eliminarTransporte(idTransporte) {
    const [result] = await pool.query(
        `UPDATE transporte
        SET Estado = 'inactivo'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}

static async ponerEnMantenimiento(idTransporte) {
    const [result] = await pool.query(
        `UPDATE transporte
        SET Estado = 'mantenimiento'
        WHERE ID_Transporte = ?`,
        [idTransporte]
    );

    return result;
}

static async buscarPlacaEnOtroTransporte(placa, idTransporte) {
    const [rows] = await pool.query(
        `SELECT *
        FROM transporte
        WHERE Placa = ?
        AND ID_Transporte <> ?`,
        [placa, idTransporte]
    );

    return rows[0];
}

}

module.exports = Transporte;
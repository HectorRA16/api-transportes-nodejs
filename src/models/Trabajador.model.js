const { pool } = require('../config/mysql');

class Trabajador {
    static async buscarPorCedula(cedula) {
        const [rows] = await pool.query(
            `SELECT * FROM Trabajador WHERE Cedula = ?`,
            [cedula]
        );

        return rows[0];
    }

    static async crearTrabajador(data) {
        const { Nombre, Cedula, FechaContratacion, Password } = data;

        const [result] = await pool.query(
            `INSERT INTO Trabajador (Nombre, Cedula, FechaContratacion, Password, is_active)
            VALUES (?, ?, ?, ?, true)`,
            [Nombre, Cedula, FechaContratacion, Password]
        );

        return result;
    }

    static async obtenerPorId(idTrabajador) {
        const [rows] = await pool.query(
            `SELECT ID_Trabajador, Nombre, Cedula, FechaContratacion, is_active
            FROM Trabajador
            WHERE ID_Trabajador = ?`,
            [idTrabajador]
        );

        return rows[0];
    }

    static async obtenerConTransportes(idTrabajador) {
        const [rows] = await pool.query(
            `SELECT 
                t.ID_Trabajador,
                t.Nombre,
                t.Cedula,
                t.FechaContratacion,
                tr.ID_Transporte,
                tr.Placa,
                tr.Capacidad,
                tr.Costo,
                tr.Estado,
                m.FechaAsignacion
            FROM Trabajador t
            LEFT JOIN Manejo m
                ON t.ID_Trabajador = m.ID_Trabajador
            LEFT JOIN Transporte tr
                ON m.ID_Transporte = tr.ID_Transporte
            WHERE t.ID_Trabajador = ?`,
            [idTrabajador]
        );

        return rows;
    }

    static async desactivarTrabajador(idTrabajador) {
        const [result] = await pool.query(
            `UPDATE Trabajador
            SET is_active = false
            WHERE ID_Trabajador = ?`,
            [idTrabajador]
        );

        return result;
    }

    static async activarTrabajador(idTrabajador) {
        const [result] = await pool.query(
            `UPDATE Trabajador
            SET is_active = true
            WHERE ID_Trabajador = ?`,
            [idTrabajador]
        );

        return result;
    }
}

module.exports = Trabajador;
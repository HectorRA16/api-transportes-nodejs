const { pool } = require('../config/mysql');

class Trabajador {
    static async buscarPorCedula(cedula) {
        const [rows] = await pool.query(
            `SELECT * FROM trabajador WHERE Cedula = ?`,
            [cedula]
        );

        return rows[0];
    }

    static async crearTrabajador(data) {
        const { Nombre, Cedula, FechaContratacion, Password } = data;

        const [result] = await pool.query(
            `INSERT INTO trabajador (Nombre, Cedula, FechaContratacion, Password, is_active)
            VALUES (?, ?, ?, ?, true)`,
            [Nombre, Cedula, FechaContratacion, Password]
        );

        return result;
    }

    static async obtenerPorId(idTrabajador) {
        const [rows] = await pool.query(
            `SELECT ID_Trabajador, Nombre, Cedula, FechaContratacion, is_active
            FROM trabajador
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
            FROM trabajador t
            LEFT JOIN manejo m
                ON t.ID_Trabajador = m.ID_Trabajador
            LEFT JOIN transporte tr
                ON m.ID_Transporte = tr.ID_Transporte
            WHERE t.ID_Trabajador = ?`,
            [idTrabajador]
        );

        return rows;
    }

    static async desactivarTrabajador(idTrabajador) {
        const [result] = await pool.query(
            `UPDATE trabajador
            SET is_active = false
            WHERE ID_Trabajador = ?`,
            [idTrabajador]
        );

        return result;
    }

    static async activarTrabajador(idTrabajador) {
        const [result] = await pool.query(
            `UPDATE trabajador
            SET is_active = true
            WHERE ID_Trabajador = ?`,
            [idTrabajador]
        );

        return result;
    }

    static async obtenerTodosConTransportes() {
    const [rows] = await pool.query(
        `SELECT 
            t.ID_Trabajador,
            t.Nombre,
            t.Cedula,
            t.FechaContratacion,
            t.is_active,
            tr.ID_Transporte,
            tr.Placa,
            tr.Capacidad,
            tr.Costo,
            tr.Estado,
            m.FechaAsignacion
        FROM trabajador t
        LEFT JOIN manejo m
            ON t.ID_Trabajador = m.ID_Trabajador
        LEFT JOIN transporte tr
            ON m.ID_Transporte = tr.ID_Transporte
        ORDER BY t.ID_Trabajador ASC, m.FechaAsignacion DESC`
    );

    return rows;
}

static async actualizarTrabajador(idTrabajador, data) {
    const campos = [];
    const valores = [];

    if (data.Nombre !== undefined) {
        campos.push('Nombre = ?');
        valores.push(data.Nombre);
    }

    if (data.Cedula !== undefined) {
        campos.push('Cedula = ?');
        valores.push(data.Cedula || null);
    }

    if (data.FechaContratacion !== undefined) {
        campos.push('FechaContratacion = ?');
        valores.push(data.FechaContratacion || null);
    }

    if (campos.length === 0) {
        return {
            affectedRows: 0
        };
    }

    valores.push(idTrabajador);

    const [result] = await pool.query(
        `UPDATE trabajador
        SET ${campos.join(', ')}
        WHERE ID_Trabajador = ?`,
        valores
    );

    return result;
}

static async buscarCedulaEnOtroTrabajador(cedula, idTrabajador) {
    const [rows] = await pool.query(
        `SELECT ID_Trabajador, Nombre, Cedula
        FROM trabajador
        WHERE Cedula = ?
        AND ID_Trabajador <> ?`,
        [cedula, idTrabajador]
    );

    return rows[0];
}

}

module.exports = Trabajador;
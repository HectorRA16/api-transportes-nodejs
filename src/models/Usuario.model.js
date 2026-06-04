const { pool } = require('../config/mysql');

class Usuario {
    static async buscarPorEmail(email) {
        const [rows] = await pool.query(
        `SELECT 
            ID_Usuario,
            Nombre,
            Email,
            Password,
            Telefono,
            Rol,
            is_active
        FROM Usuario
        WHERE Email = ?`,
        [email]
    );
        return rows[0];
    }

    static async crearUsuario(data) {
        const { Nombre, Email, Password, Telefono, Rol } = data;

    const [result] = await pool.query(
        `INSERT INTO Usuario (Nombre, Email, Password, Telefono, Rol, is_active)
        VALUES (?, ?, ?, ?, ?, true)`,
        [Nombre, Email, Password, Telefono, Rol]
    );

    return result;
    }

    static async obtenerPorId(idUsuario) {
    const [rows] = await pool.query(
        `SELECT 
            ID_Usuario,
            Nombre,
            Email,
            Telefono,
            Rol,
            is_active
        FROM Usuario
        WHERE ID_Usuario = ?`,
        [idUsuario]
    );

    return rows[0];
}
static async actualizarUsuario(idUsuario, data) {
    const { Nombre, Email, Telefono } = data;

    const [result] = await pool.query(
        `UPDATE Usuario
        SET Nombre = ?, Email = ?, Telefono = ?
        WHERE ID_Usuario = ?`,
        [Nombre, Email, Telefono, idUsuario]
    );

    return result;
}
    static async desactivarUsuario(idUsuario) {
        const [result] = await pool.query(
            `UPDATE Usuario
            SET is_active = false
            WHERE ID_Usuario = ?`,
            [idUsuario]
        );

        return result;
    }

    static async activarUsuario(idUsuario) {
    const [result] = await pool.query(
        `UPDATE Usuario
        SET is_active = true
        WHERE ID_Usuario = ?`,
        [idUsuario]
    );

    return result;
}
}

module.exports = Usuario;
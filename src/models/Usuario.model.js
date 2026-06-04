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
        FROM usuario
        WHERE Email = ?`,
        [email]
    );
        return rows[0];
    }

    static async crearUsuario(data) {
        const { Nombre, Email, Password, Telefono, Rol } = data;

    const [result] = await pool.query(
        `INSERT INTO usuario (Nombre, Email, Password, Telefono, Rol, is_active)
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
        FROM usuario
        WHERE ID_Usuario = ?`,
        [idUsuario]
    );

    return rows[0];
}
static async actualizarUsuario(idUsuario, data) {
    const { Nombre, Email, Telefono } = data;

    const [result] = await pool.query(
        `UPDATE usuario
        SET Nombre = ?, Email = ?, Telefono = ?
        WHERE ID_Usuario = ?`,
        [Nombre, Email, Telefono, idUsuario]
    );

    return result;
}
    static async desactivarUsuario(idUsuario) {
        const [result] = await pool.query(
            `UPDATE usuario
            SET is_active = false
            WHERE ID_Usuario = ?`,
            [idUsuario]
        );

        return result;
    }

    static async activarUsuario(idUsuario) {
    const [result] = await pool.query(
        `UPDATE usuario
        SET is_active = true
        WHERE ID_Usuario = ?`,
        [idUsuario]
    );

    return result;
}

static async crearUsuarioConTrabajadorSiAplica(data) {
    const { Nombre, Email, Password, Telefono, Rol } = data;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [usuarioResult] = await connection.query(
            `INSERT INTO usuario (Nombre, Email, Password, Telefono, Rol, is_active)
            VALUES (?, ?, ?, ?, ?, true)`,
            [Nombre, Email, Password, Telefono, Rol]
        );

        let trabajadorResult = null;

        if (Rol === 'trabajador') {
            const [result] = await connection.query(
                `INSERT INTO trabajador (
                    Nombre,
                    Cedula,
                    FechaContratacion,
                    Password,
                    is_active,
                    ID_Usuario
                )
                VALUES (?, NULL, CURDATE(), ?, true, ?)`,
                [Nombre, Password, usuarioResult.insertId]
            );

            trabajadorResult = result;
        }

        await connection.commit();

        return {
            ID_Usuario: usuarioResult.insertId,
            ID_Trabajador: trabajadorResult ? trabajadorResult.insertId : null
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

}

module.exports = Usuario;
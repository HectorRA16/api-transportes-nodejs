function soloAdmin(req, res, next) {
    const rol = req.user?.rol || req.user?.Rol;

    if (rol === 'admin') {
        return next();
    }

    return res.status(403).json({
        mensaje: 'Acceso solo para administradores'
    });
}

module.exports = soloAdmin;
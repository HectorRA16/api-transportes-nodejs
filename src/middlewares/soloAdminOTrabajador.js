function soloAdminOTrabajador(req, res, next) {
    const rol = req.user?.rol || req.user?.Rol;

    if (rol === 'admin' || rol === 'trabajador') {
        return next();
    }

    return res.status(403).json({
        mensaje: 'Acceso solo para administradores o trabajadores'
    });
}

module.exports = soloAdminOTrabajador;
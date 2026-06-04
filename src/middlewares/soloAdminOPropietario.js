function soloAdminOPropietario(req, res, next) {
    const rol = req.user?.rol || req.user?.Rol;
    const idUsuarioToken = Number(req.user?.id);
    const idUsuarioParams = Number(req.params.id);

    if (rol === 'admin' || idUsuarioToken === idUsuarioParams) {
        return next();
    }

    return res.status(403).json({
        mensaje: 'No tienes permiso para acceder a este usuario'
    });
}

module.exports = soloAdminOPropietario;
function soloTrabajador(req, res, next) {

    const rol = req.user?.rol || req.user?.Rol;
    const tipo = req.user?.tipo;

    if (rol === 'trabajador' || rol === 'admin' || tipo === 'trabajador') {
        return next();
    }

    return res.status(403).json({
        mensaje: 'Acceso solo para trabajadores'
    });
}

module.exports = soloTrabajador;
function soloUsuario(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({
                mensaje: 'No autenticado'
            });
        }

        if (req.user.tipo !== 'usuario') {
            return res.status(403).json({
                mensaje: 'Acceso solo para usuarios'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error al validar usuario',
            error: error.message
        });
    }
}

module.exports = soloUsuario;
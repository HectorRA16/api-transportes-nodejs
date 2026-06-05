import { apiRequest, buildQuery } from '../api.js';
import {
    setPage,
    showError,
    showSuccess,
    getValue,
    getNumber,
    table,
    card,
    resultBox
} from '../components.js';
import { drawPieChart } from '../charts.js';

export const adminMenu = [
    { id: 'adminInicio', label: 'Dashboard', icon: '📊' },
    { id: 'registrarUsuario', label: 'Registrar usuario', icon: '👤' },
    { id: 'usuarios', label: 'Usuarios', icon: '🧑‍💼' },
    { id: 'tarjetasAdmin', label: 'Tarjetas', icon: '💳' },
    { id: 'trabajadoresAdmin', label: 'Trabajadores', icon: '👷' },
    { id: 'transportesAdmin', label: 'Transportes', icon: '🚌' },
    { id: 'viajesAdmin', label: 'Viajes', icon: '🗺️' }
];

export function renderAdminView(view) {
    const views = {
        adminInicio,
        registrarUsuario,
        usuarios,
        tarjetasAdmin,
        trabajadoresAdmin,
        transportesAdmin,
        viajesAdmin
    };

    views[view]?.();
}

async function adminInicio() {
    setPage(
        'Dashboard administrativo',
        'Resumen general del sistema',
        `
            <section class="dashboard-grid" id="summaryCards"></section>

            <section class="module-card chart-card">
                <h2>Distribución general del sistema</h2>
                <div class="chart-layout">
                    <canvas id="generalPie" width="300" height="300"></canvas>
                    <div id="generalPieLegend" class="legend"></div>
                </div>
                ${resultBox()}
            </section>
        `
    );

    try {
        const data = await apiRequest('/api/reportes/resumen-general');

        const cards = [
            ['Usuarios', data.usuarios || 0],
            ['Tarjetas', data.tarjetas || 0],
            ['Transportes', data.transportes || 0],
            ['Recargas', data.recargas?.total || 0],
            ['Viajes', data.viajes || 0],
            ['Pagos', data.pagos?.total || 0]
        ];

        document.getElementById('summaryCards').innerHTML = cards.map(item => `
            <article class="stat-card">
                <span>${item[0]}</span>
                <strong>${item[1]}</strong>
            </article>
        `).join('');

        drawPieChart(
            'generalPie',
            ['Usuarios', 'Tarjetas', 'Transportes', 'Recargas', 'Viajes', 'Pagos'],
            [
                data.usuarios || 0,
                data.tarjetas || 0,
                data.transportes || 0,
                data.recargas?.total || 0,
                data.viajes || 0,
                data.pagos?.total || 0
            ]
        );

        showSuccess('Reporte general cargado correctamente', {
            Usuarios: data.usuarios || 0,
            Tarjetas: data.tarjetas || 0,
            Transportes: data.transportes || 0,
            Total_Recargas: data.recargas?.total || 0,
            Dinero_Recargado: data.recargas?.dineroRecargado || 0,
            Total_Viajes: data.viajes || 0,
            Total_Pagos: data.pagos?.total || 0,
            Dinero_Cobrado: data.pagos?.dineroCobrado || 0
        });

    } catch (error) {
        showError(error);
    }
}

function registrarUsuario() {
    setPage(
        'Registrar nuevo usuario',
        'Crea usuarios con rol usuario, trabajador o admin',
        `
            <form id="formUsuario" class="module-card form-grid">
                <label>Nombre</label>
                <input id="usuarioNombre" placeholder="Nombre completo" required>

                <label>Email</label>
                <input id="usuarioEmail" type="email" placeholder="correo@ejemplo.com" required>

                <label>Password</label>
                <input id="usuarioPassword" type="password" placeholder="Contraseña" required>

                <label>Teléfono</label>
                <input id="usuarioTelefono" placeholder="Teléfono">

                <label>Rol</label>
                <select id="usuarioRol">
                    <option value="usuario">usuario</option>
                    <option value="trabajador">trabajador</option>
                    <option value="admin">admin</option>
                </select>

                <button type="submit">Registrar usuario</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const body = {
                Nombre: getValue('usuarioNombre'),
                Email: getValue('usuarioEmail'),
                Password: getValue('usuarioPassword'),
                Telefono: getValue('usuarioTelefono'),
                Rol: getValue('usuarioRol')
            };

            const data = await apiRequest('/api/usuarios', {
                method: 'POST',
                body
            });

            showSuccess('Usuario registrado correctamente', {
                ID_Usuario: data.ID_Usuario,
                ID_Trabajador: data.ID_Trabajador || 'No aplica',
                Nombre: body.Nombre,
                Email: body.Email,
                Rol: body.Rol
            });

        } catch (error) {
            showError(error);
        }
    });
}

function usuarios() {
    setPage(
        'Administrar usuarios',
        'Buscar, actualizar, activar y desactivar usuarios',
        `
            <section class="panel-grid">
                ${card('Buscar usuario por ID', `
                    <input id="buscarUsuarioId" type="number" placeholder="ID Usuario">
                    <button id="btnBuscarUsuario">Buscar usuario</button>
                    ${resultBox('resultadoBuscarUsuario')}
                `)}

                ${card('Actualizar usuario', `
                    <input id="actualizarUsuarioId" type="number" placeholder="ID Usuario">
                    <input id="actualizarNombre" placeholder="Nombre">
                    <input id="actualizarEmail" type="email" placeholder="Email">
                    <input id="actualizarTelefono" placeholder="Teléfono">

                    <select id="actualizarRol">
                        <option value="">Rol sin cambio</option>
                        <option value="usuario">usuario</option>
                        <option value="trabajador">trabajador</option>
                        <option value="admin">admin</option>
                    </select>

                    <button id="btnActualizarUsuario">Actualizar usuario</button>
                    ${resultBox('resultadoActualizarUsuario')}
                `)}

                ${card('Activar / desactivar usuario', `
                    <input id="estadoUsuarioId" type="number" placeholder="ID Usuario">
                    <div class="actions">
                        <button id="btnActivarUsuario" class="success">Activar</button>
                        <button id="btnDesactivarUsuario" class="danger">Desactivar</button>
                    </div>
                    ${resultBox('resultadoEstadoUsuario')}
                `)}
            </section>
        `
    );

    document.getElementById('btnBuscarUsuario').addEventListener('click', async () => {
        try {
            const id = getNumber('buscarUsuarioId');
            const data = await apiRequest(`/api/usuarios/${id}`);

            showSuccess('Usuario encontrado', data.usuario || data, 'resultadoBuscarUsuario');

        } catch (error) {
            showError(error, 'resultadoBuscarUsuario');
        }
    });

    document.getElementById('btnActualizarUsuario').addEventListener('click', async () => {
        try {
            const id = getNumber('actualizarUsuarioId');

            const body = {
                Nombre: getValue('actualizarNombre'),
                Email: getValue('actualizarEmail'),
                Telefono: getValue('actualizarTelefono')
            };

            const rol = getValue('actualizarRol');

            if (rol) {
                body.Rol = rol;
            }

            const data = await apiRequest(`/api/usuarios/${id}`, {
                method: 'PUT',
                body
            });

            showSuccess('Usuario actualizado correctamente', {
                ID_Usuario: id,
                Nombre: body.Nombre,
                Email: body.Email,
                Telefono: body.Telefono,
                Rol: body.Rol || 'Sin cambio',
                Mensaje: data.mensaje
            }, 'resultadoActualizarUsuario');

        } catch (error) {
            showError(error, 'resultadoActualizarUsuario');
        }
    });

    document.getElementById('btnActivarUsuario').addEventListener('click', () => cambiarEstadoUsuario('activar'));
    document.getElementById('btnDesactivarUsuario').addEventListener('click', () => cambiarEstadoUsuario('desactivar'));
}

async function cambiarEstadoUsuario(accion) {
    try {
        const id = getNumber('estadoUsuarioId');

        const data = await apiRequest(`/api/usuarios/${id}/${accion}`, {
            method: 'PUT'
        });

        showSuccess(
            accion === 'activar' ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente',
            {
                ID_Usuario: id,
                Estado: accion === 'activar' ? 'activo' : 'inactivo',
                Mensaje: data.mensaje
            },
            'resultadoEstadoUsuario'
        );

    } catch (error) {
        showError(error, 'resultadoEstadoUsuario');
    }
}

function tarjetasAdmin() {
    setPage(
        'Administrar tarjetas',
        'Buscar por NFC y cambiar estado de tarjetas',
        `
            <section class="panel-grid">
                ${card('Buscar tarjeta por NFC_ID', `
                    <input id="adminNfc" placeholder="NFC_ID">
                    <button id="btnBuscarNfc">Buscar tarjeta</button>
                    ${resultBox('resultadoBuscarTarjeta')}
                `)}

                ${card('Bloquear / desbloquear tarjeta', `
                    <input id="adminTarjetaId" type="number" placeholder="ID Tarjeta">
                    <div class="actions">
                        <button id="btnAdminBloquear" class="danger">Bloquear</button>
                        <button id="btnAdminDesbloquear" class="success">Desbloquear</button>
                    </div>
                    ${resultBox('resultadoEstadoTarjeta')}
                `)}
            </section>
        `
    );

    document.getElementById('btnBuscarNfc').addEventListener('click', async () => {
        try {
            const nfc = getValue('adminNfc');
            const data = await apiRequest(`/api/tarjetas/nfc/${nfc}`);

            showSuccess('Tarjeta encontrada', data.tarjeta || data, 'resultadoBuscarTarjeta');

        } catch (error) {
            showError(error, 'resultadoBuscarTarjeta');
        }
    });

    document.getElementById('btnAdminBloquear').addEventListener('click', () => cambiarEstadoTarjetaAdmin('bloquear'));
    document.getElementById('btnAdminDesbloquear').addEventListener('click', () => cambiarEstadoTarjetaAdmin('desbloquear'));
}

async function cambiarEstadoTarjetaAdmin(accion) {
    try {
        const id = getNumber('adminTarjetaId');

        const data = await apiRequest(`/api/tarjetas/${id}/${accion}`, {
            method: 'PUT'
        });

        showSuccess(
            accion === 'bloquear' ? 'Tarjeta bloqueada correctamente' : 'Tarjeta desbloqueada correctamente',
            {
                ID_Tarjeta: id,
                Estado: accion === 'bloquear' ? 'bloqueada' : 'activa',
                Mensaje: data.mensaje
            },
            'resultadoEstadoTarjeta'
        );

    } catch (error) {
        showError(error, 'resultadoEstadoTarjeta');
    }
}

function trabajadoresAdmin() {
    setPage(
        'Administrar trabajadores',
        'Registrar, buscar, actualizar, activar, desactivar y asignar transportes',
        `
            <section class="panel-grid">
                ${card('Registrar trabajador', `
                    <input id="trabNombre" placeholder="Nombre">
                    <input id="trabCedula" placeholder="Cédula opcional">
                    <input id="trabPassword" type="password" placeholder="Password">
                    <input id="trabFecha" type="date">
                    <input id="trabIdUsuario" type="number" placeholder="ID Usuario opcional">
                    <button id="btnRegistrarTrabajador">Registrar trabajador</button>
                    ${resultBox('resultadoRegistrarTrabajador')}
                `)}

                ${card('Buscar trabajador por ID', `
                    <input id="buscarTrabajadorId" type="number" placeholder="ID Trabajador">
                    <button id="btnBuscarTrabajador">Buscar trabajador</button>
                    ${resultBox('resultadoBuscarTrabajador')}
                `)}

                ${card('Actualizar trabajador', `
                    <input id="actualizarTrabajadorId" type="number" placeholder="ID Trabajador">
                    <input id="actualizarTrabNombre" placeholder="Nombre">
                    <input id="actualizarTrabCedula" placeholder="Cédula">
                    <input id="actualizarTrabFecha" type="date">
                    <button id="btnActualizarTrabajador">Actualizar trabajador</button>
                    ${resultBox('resultadoActualizarTrabajador')}
                `)}

                ${card('Trabajadores con transportes', `
                    <button id="btnTrabajadoresTransportes">Ver asignaciones</button>
                    ${resultBox('resultadoTrabajadoresTransportes')}
                    <div id="tablaTrabajadoresTransportes"></div>
                `)}

                ${card('Asignar trabajador a transporte', `
                    <input id="adminAsignarTrabajador" type="number" placeholder="ID Trabajador">
                    <input id="adminAsignarTransporte" type="number" placeholder="ID Transporte">
                    <input id="adminFechaAsignacion" type="date">
                    <button id="btnAdminAsignar">Asignar transporte</button>
                    ${resultBox('resultadoAsignarTransporte')}
                `)}

                ${card('Desasignar trabajador de transporte', `
                    <input id="adminQuitarTrabajador" type="number" placeholder="ID Trabajador">
                    <input id="adminQuitarTransporte" type="number" placeholder="ID Transporte">
                    <button id="btnAdminQuitarAsignacion" class="danger">Desasignar</button>
                    ${resultBox('resultadoQuitarAsignacion')}
                `)}

                ${card('Activar / desactivar trabajador', `
                    <input id="estadoTrabajadorId" type="number" placeholder="ID Trabajador">
                    <div class="actions">
                        <button id="btnActivarTrabajador" class="success">Activar</button>
                        <button id="btnDesactivarTrabajador" class="danger">Desactivar</button>
                    </div>
                    ${resultBox('resultadoEstadoTrabajador')}
                `)}
            </section>
        `
    );

    document.getElementById('btnRegistrarTrabajador').addEventListener('click', async () => {
        try {
            const body = {
                Nombre: getValue('trabNombre'),
                Cedula: getValue('trabCedula') || null,
                Password: getValue('trabPassword'),
                FechaContratacion: getValue('trabFecha') || null
            };

            const idUsuario = getNumber('trabIdUsuario');

            if (idUsuario) {
                body.ID_Usuario = idUsuario;
            }

            const data = await apiRequest('/api/trabajadores', {
                method: 'POST',
                body
            });

            showSuccess('Trabajador registrado correctamente', {
                ID_Trabajador: data.ID_Trabajador || data.insertId,
                Nombre: body.Nombre,
                Cedula: body.Cedula || 'Pendiente',
                Fecha_Contratacion: body.FechaContratacion || 'Fecha actual'
            }, 'resultadoRegistrarTrabajador');

        } catch (error) {
            showError(error, 'resultadoRegistrarTrabajador');
        }
    });

    document.getElementById('btnBuscarTrabajador').addEventListener('click', async () => {
        try {
            const id = getNumber('buscarTrabajadorId');
            const data = await apiRequest(`/api/trabajadores/${id}`);

            showSuccess('Trabajador encontrado', data.trabajador || data, 'resultadoBuscarTrabajador');

        } catch (error) {
            showError(error, 'resultadoBuscarTrabajador');
        }
    });

    document.getElementById('btnActualizarTrabajador').addEventListener('click', async () => {
        try {
            const id = getNumber('actualizarTrabajadorId');

            const body = {
                Nombre: getValue('actualizarTrabNombre'),
                Cedula: getValue('actualizarTrabCedula'),
                FechaContratacion: getValue('actualizarTrabFecha') || null
            };

            const data = await apiRequest(`/api/trabajadores/${id}`, {
                method: 'PUT',
                body
            });

            showSuccess('Trabajador actualizado correctamente', {
                ID_Trabajador: id,
                Nombre: body.Nombre,
                Cedula: body.Cedula,
                Fecha_Contratacion: body.FechaContratacion || 'Sin cambio',
                Mensaje: data.mensaje
            }, 'resultadoActualizarTrabajador');

        } catch (error) {
            showError(error, 'resultadoActualizarTrabajador');
        }
    });

    document.getElementById('btnTrabajadoresTransportes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/trabajadores/transportes/asignados');

            showSuccess('Asignaciones consultadas correctamente', {
                Total_Trabajadores: data.total || data.trabajadores?.length || 0
            }, 'resultadoTrabajadoresTransportes');

            document.getElementById('tablaTrabajadoresTransportes').innerHTML =
                renderTrabajadoresTransportes(data.trabajadores || []);

        } catch (error) {
            showError(error, 'resultadoTrabajadoresTransportes');
        }
    });

    document.getElementById('btnAdminAsignar').addEventListener('click', async () => {
        try {
            const body = {
                ID_Trabajador: getNumber('adminAsignarTrabajador'),
                ID_Transporte: getNumber('adminAsignarTransporte'),
                FechaAsignacion: getValue('adminFechaAsignacion') || null
            };

            const data = await apiRequest('/api/manejo/asignar', {
                method: 'POST',
                body
            });

            showSuccess('Transporte asignado correctamente', {
                ID_Trabajador: body.ID_Trabajador,
                ID_Transporte: body.ID_Transporte,
                Fecha_Asignacion: body.FechaAsignacion || 'Fecha actual',
                Mensaje: data.mensaje
            }, 'resultadoAsignarTransporte');

        } catch (error) {
            showError(error, 'resultadoAsignarTransporte');
        }
    });

    document.getElementById('btnAdminQuitarAsignacion').addEventListener('click', async () => {
        try {
            const body = {
                ID_Trabajador: getNumber('adminQuitarTrabajador'),
                ID_Transporte: getNumber('adminQuitarTransporte')
            };

            const data = await apiRequest('/api/manejo/quitar', {
                method: 'DELETE',
                body
            });

            showSuccess('Trabajador desasignado correctamente', {
                ID_Trabajador: body.ID_Trabajador,
                ID_Transporte: body.ID_Transporte,
                Mensaje: data.mensaje
            }, 'resultadoQuitarAsignacion');

        } catch (error) {
            showError(error, 'resultadoQuitarAsignacion');
        }
    });

    document.getElementById('btnActivarTrabajador').addEventListener('click', () => cambiarEstadoTrabajador('activar'));
    document.getElementById('btnDesactivarTrabajador').addEventListener('click', () => cambiarEstadoTrabajador('desactivar'));
}

function renderTrabajadoresTransportes(trabajadores) {
    if (!Array.isArray(trabajadores) || trabajadores.length === 0) {
        return '<p class="empty">No hay trabajadores para mostrar.</p>';
    }

    return `
        <div class="assignment-list">
            ${trabajadores.map(trabajador => `
                <article class="assignment-card">
                    <h3>${trabajador.Nombre}</h3>
                    <p><strong>ID Trabajador:</strong> ${trabajador.ID_Trabajador}</p>
                    <p><strong>Cédula:</strong> ${trabajador.Cedula || 'Pendiente'}</p>
                    <p><strong>Estado:</strong> ${trabajador.is_active ? 'Activo' : 'Inactivo'}</p>

                    <h4>Transportes asignados</h4>

                    ${trabajador.transportes && trabajador.transportes.length > 0
                        ? `
                            <ul>
                                ${trabajador.transportes.map(transporte => `
                                    <li>
                                        <strong>${transporte.Placa}</strong>
                                        — ID ${transporte.ID_Transporte}
                                        — ${transporte.Estado}
                                    </li>
                                `).join('')}
                            </ul>
                        `
                        : '<p class="empty">Sin transportes asignados.</p>'
                    }
                </article>
            `).join('')}
        </div>
    `;
}

async function cambiarEstadoTrabajador(accion) {
    try {
        const id = getNumber('estadoTrabajadorId');

        const data = await apiRequest(`/api/trabajadores/${id}/${accion}`, {
            method: 'PUT'
        });

        showSuccess(
            accion === 'activar' ? 'Trabajador activado correctamente' : 'Trabajador desactivado correctamente',
            {
                ID_Trabajador: id,
                Estado: accion === 'activar' ? 'activo' : 'inactivo',
                Mensaje: data.mensaje
            },
            'resultadoEstadoTrabajador'
        );

    } catch (error) {
        showError(error, 'resultadoEstadoTrabajador');
    }
}

function transportesAdmin() {
    setPage(
        'Administrar transportes',
        'Registrar, listar, actualizar y cambiar estado de transportes',
        `
            <section class="panel-grid">
                ${card('Registrar transporte', `
                    <input id="transPlaca" placeholder="Placa">
                    <input id="transCapacidad" type="number" placeholder="Capacidad">
                    <input id="transCosto" type="number" step="0.01" placeholder="Costo">
                    <button id="btnRegistrarTransporte">Registrar transporte</button>
                    ${resultBox('resultadoRegistrarTransporte')}
                `)}

                ${card('Listar transportes activos', `
                    <button id="btnTransportesActivos">Listar activos</button>
                    ${resultBox('resultadoTransportesActivos')}
                    <div id="tablaTransportesActivos"></div>
                `)}

                ${card('Actualizar transporte', `
                    <input id="actualizarTransporteId" type="number" placeholder="ID Transporte">
                    <input id="actualizarPlaca" placeholder="Placa">
                    <input id="actualizarCapacidad" type="number" placeholder="Capacidad">
                    <input id="actualizarCosto" type="number" step="0.01" placeholder="Costo">

                    <select id="actualizarEstado">
                        <option value="activo">activo</option>
                        <option value="mantenimiento">mantenimiento</option>
                        <option value="inactivo">inactivo</option>
                    </select>

                    <button id="btnActualizarTransporte">Actualizar transporte</button>
                    ${resultBox('resultadoActualizarTransporte')}
                `)}

                ${card('Cambiar estado de transporte', `
                    <input id="estadoTransporteId" type="number" placeholder="ID Transporte">
                    <div class="actions">
                        <button id="btnAltaTransporte" class="success">Dar de alta</button>
                        <button id="btnBajaTransporte" class="danger">Dar de baja</button>
                        <button id="btnMantenimientoTransporte" class="warning">Mantenimiento</button>
                    </div>
                    ${resultBox('resultadoEstadoTransporte')}
                `)}
            </section>
        `
    );

    document.getElementById('btnRegistrarTransporte').addEventListener('click', async () => {
        try {
            const body = {
                Placa: getValue('transPlaca'),
                Capacidad: getNumber('transCapacidad'),
                Costo: getNumber('transCosto'),
                Estado: 'activo'
            };

            const data = await apiRequest('/api/transportes', {
                method: 'POST',
                body
            });

            showSuccess('Transporte registrado correctamente', {
                ID_Transporte: data.ID_Transporte || data.insertId,
                Placa: body.Placa,
                Capacidad: body.Capacidad,
                Costo: body.Costo,
                Estado: body.Estado
            }, 'resultadoRegistrarTransporte');

        } catch (error) {
            showError(error, 'resultadoRegistrarTransporte');
        }
    });

    document.getElementById('btnTransportesActivos').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/transportes/activos');

            const rows = data.transportes || data;

            showSuccess('Transportes activos consultados', {
                Total_Transportes: Array.isArray(rows) ? rows.length : data.total
            }, 'resultadoTransportesActivos');

            document.getElementById('tablaTransportesActivos').innerHTML = table(rows);

        } catch (error) {
            showError(error, 'resultadoTransportesActivos');
        }
    });

    document.getElementById('btnActualizarTransporte').addEventListener('click', async () => {
        try {
            const id = getNumber('actualizarTransporteId');

            const body = {
                Placa: getValue('actualizarPlaca'),
                Capacidad: getNumber('actualizarCapacidad'),
                Costo: getNumber('actualizarCosto'),
                Estado: getValue('actualizarEstado')
            };

            const data = await apiRequest(`/api/transportes/${id}`, {
                method: 'PUT',
                body
            });

            showSuccess('Transporte actualizado correctamente', {
                ID_Transporte: id,
                Placa: body.Placa,
                Capacidad: body.Capacidad,
                Costo: body.Costo,
                Estado: body.Estado,
                Mensaje: data.mensaje
            }, 'resultadoActualizarTransporte');

        } catch (error) {
            showError(error, 'resultadoActualizarTransporte');
        }
    });

    document.getElementById('btnAltaTransporte').addEventListener('click', () => cambiarEstadoTransporte('alta'));
    document.getElementById('btnBajaTransporte').addEventListener('click', () => cambiarEstadoTransporte('baja'));
    document.getElementById('btnMantenimientoTransporte').addEventListener('click', () => cambiarEstadoTransporte('mantenimiento'));
}

async function cambiarEstadoTransporte(accion) {
    try {
        const id = getNumber('estadoTransporteId');

        const data = await apiRequest(`/api/transportes/${id}/${accion}`, {
            method: 'PUT'
        });

        const estados = {
            alta: 'activo',
            baja: 'inactivo',
            mantenimiento: 'mantenimiento'
        };

        showSuccess('Estado del transporte actualizado', {
            ID_Transporte: id,
            Nuevo_Estado: estados[accion],
            Mensaje: data.mensaje
        }, 'resultadoEstadoTransporte');

    } catch (error) {
        showError(error, 'resultadoEstadoTransporte');
    }
}

function viajesAdmin() {
    setPage(
        'Filtrar viajes',
        'Consulta viajes por usuario, transporte o rango de fechas',
        `
            <section class="panel-grid">
                ${card('Viajes por usuario', `
                    <input id="viajesUsuarioId" type="number" placeholder="ID Usuario">
                    <button id="btnViajesUsuario">Consultar viajes</button>
                    ${resultBox('resultadoViajesUsuario')}
                    <div id="tablaViajesUsuario"></div>
                `)}

                ${card('Viajes por transporte', `
                    <input id="viajesTransporteId" type="number" placeholder="ID Transporte">
                    <button id="btnViajesTransporte">Consultar viajes</button>
                    ${resultBox('resultadoViajesTransporte')}
                    <div id="tablaViajesTransporte"></div>
                `)}

                ${card('Viajes de transporte por fechas', `
                    <input id="rangoTransporteId" type="number" placeholder="ID Transporte">
                    <input id="fechaInicio" type="date">
                    <input id="fechaFin" type="date">
                    <button id="btnViajesRango">Consultar rango</button>
                    ${resultBox('resultadoViajesRango')}
                    <div id="tablaViajesRango"></div>
                `)}
            </section>
        `
    );

    document.getElementById('btnViajesUsuario').addEventListener('click', async () => {
        try {
            const id = getNumber('viajesUsuarioId');
            const data = await apiRequest(`/api/viajes/usuario/${id}`);

            const rows = data.viajes || data;

            showSuccess('Viajes del usuario consultados', {
                ID_Usuario: id,
                Total_Viajes: Array.isArray(rows) ? rows.length : data.total
            }, 'resultadoViajesUsuario');

            document.getElementById('tablaViajesUsuario').innerHTML = table(rows);

        } catch (error) {
            showError(error, 'resultadoViajesUsuario');
        }
    });

    document.getElementById('btnViajesTransporte').addEventListener('click', async () => {
        try {
            const id = getNumber('viajesTransporteId');
            const data = await apiRequest(`/api/viajes/transporte/${id}`);

            const rows = data.viajes || data;

            showSuccess('Viajes del transporte consultados', {
                ID_Transporte: id,
                Total_Viajes: Array.isArray(rows) ? rows.length : data.total
            }, 'resultadoViajesTransporte');

            document.getElementById('tablaViajesTransporte').innerHTML = table(rows);

        } catch (error) {
            showError(error, 'resultadoViajesTransporte');
        }
    });

    document.getElementById('btnViajesRango').addEventListener('click', async () => {
        try {
            const id = getNumber('rangoTransporteId');

            const query = buildQuery({
                fechaInicio: getValue('fechaInicio'),
                fechaFin: getValue('fechaFin')
            });

            const data = await apiRequest(`/api/viajes/transporte/${id}/fechas?${query}`);

            const rows = data.viajes || data;

            showSuccess('Viajes por rango consultados', {
                ID_Transporte: id,
                Fecha_Inicio: getValue('fechaInicio'),
                Fecha_Fin: getValue('fechaFin'),
                Total_Viajes: Array.isArray(rows) ? rows.length : data.total
            }, 'resultadoViajesRango');

            document.getElementById('tablaViajesRango').innerHTML = table(rows);

        } catch (error) {
            showError(error, 'resultadoViajesRango');
        }
    });
}
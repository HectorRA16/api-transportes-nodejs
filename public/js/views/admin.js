import { apiRequest, buildQuery } from '../api.js';
import { setPage, setOutput, showError, getValue, getNumber, table, card } from '../components.js';
import { drawPieChart } from '../charts.js';

export const adminMenu = [
    { id: 'adminInicio', label: 'Dashboard', icon: '📊' },
    { id: 'registrarUsuario', label: 'Registrar usuario', icon: '👤' },
    { id: 'usuarios', label: 'Usuarios', icon: '🧑‍💼' },
    { id: 'tarjetasAdmin', label: 'Tarjetas', icon: '💳' },
    { id: 'trabajadoresAdmin', label: 'Trabajadores', icon: '👷' },
    { id: 'transportesAdmin', label: 'Transportes', icon: '🚌' },
    { id: 'viajesAdmin', label: 'Viajes', icon: '🗺️' },
    
];

export function renderAdminView(view) {
    const views = {
        adminInicio,
        registrarUsuario,
        usuarios,
        tarjetasAdmin,
        trabajadoresAdmin,
        transportesAdmin,
        viajesAdmin,
        reportesAdmin
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
                <h2>Distribución general</h2>
                <div class="chart-layout">
                    <canvas id="generalPie" width="300" height="300"></canvas>
                    <div id="generalPieLegend" class="legend"></div>
                </div>
            </section>
        `
    );

    try {
        const data = await apiRequest('/api/reportes/resumen-general');
        setOutput(data);

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
                <input id="usuarioNombre" required>

                <label>Email</label>
                <input id="usuarioEmail" type="email" required>

                <label>Password</label>
                <input id="usuarioPassword" type="password" required>

                <label>Teléfono</label>
                <input id="usuarioTelefono">

                <label>Rol</label>
                <select id="usuarioRol">
                    <option value="usuario">usuario</option>
                    <option value="trabajador">trabajador</option>
                    <option value="admin">admin</option>
                </select>

                <button type="submit">Registrar usuario</button>
            </form>
        `
    );

    document.getElementById('formUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/usuarios', {
                method: 'POST',
                body: {
                    Nombre: getValue('usuarioNombre'),
                    Email: getValue('usuarioEmail'),
                    Password: getValue('usuarioPassword'),
                    Telefono: getValue('usuarioTelefono'),
                    Rol: getValue('usuarioRol')
                }
            });

            setOutput(data);
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
                    <button id="btnBuscarUsuario">Buscar</button>
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
                    <button id="btnActualizarUsuario">Actualizar</button>
                `)}

                ${card('Activar / desactivar usuario', `
                    <input id="estadoUsuarioId" type="number" placeholder="ID Usuario">
                    <div class="actions">
                        <button id="btnActivarUsuario" class="success">Activar</button>
                        <button id="btnDesactivarUsuario" class="danger">Desactivar</button>
                    </div>
                `)}
            </section>
        `
    );

    document.getElementById('btnBuscarUsuario').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/usuarios/${getNumber('buscarUsuarioId')}`);
            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnActualizarUsuario').addEventListener('click', async () => {
        try {
            const body = {
                Nombre: getValue('actualizarNombre'),
                Email: getValue('actualizarEmail'),
                Telefono: getValue('actualizarTelefono')
            };

            const rol = getValue('actualizarRol');

            if (rol) {
                body.Rol = rol;
            }

            const data = await apiRequest(`/api/usuarios/${getNumber('actualizarUsuarioId')}`, {
                method: 'PUT',
                body
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnActivarUsuario').addEventListener('click', () => cambiarEstadoUsuario('activar'));
    document.getElementById('btnDesactivarUsuario').addEventListener('click', () => cambiarEstadoUsuario('desactivar'));
}

async function cambiarEstadoUsuario(accion) {
    try {
        const data = await apiRequest(`/api/usuarios/${getNumber('estadoUsuarioId')}/${accion}`, {
            method: 'PUT'
        });

        setOutput(data);
    } catch (error) {
        showError(error);
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
                `)}

                ${card('Bloquear / desbloquear tarjeta', `
                    <input id="adminTarjetaId" type="number" placeholder="ID Tarjeta">
                    <div class="actions">
                        <button id="btnAdminBloquear" class="danger">Bloquear</button>
                        <button id="btnAdminDesbloquear" class="success">Desbloquear</button>
                    </div>
                `)}
            </section>
        `
    );

    document.getElementById('btnBuscarNfc').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/tarjetas/nfc/${getValue('adminNfc')}`);
            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnAdminBloquear').addEventListener('click', () => cambiarEstadoTarjetaAdmin('bloquear'));
    document.getElementById('btnAdminDesbloquear').addEventListener('click', () => cambiarEstadoTarjetaAdmin('desbloquear'));
}

async function cambiarEstadoTarjetaAdmin(accion) {
    try {
        const data = await apiRequest(`/api/tarjetas/${getNumber('adminTarjetaId')}/${accion}`, {
            method: 'PUT'
        });

        setOutput(data);
    } catch (error) {
        showError(error);
    }
}

function trabajadoresAdmin() {
    setPage(
        'Administrar trabajadores',
        'Registrar, buscar, activar, desactivar y asignar transportes',
        `
            <section class="panel-grid">
                ${card('Registrar trabajador', `
                    <input id="trabNombre" placeholder="Nombre">
                    <input id="trabCedula" placeholder="Cédula">
                    <input id="trabPassword" type="password" placeholder="Password">
                    <input id="trabFecha" type="date">
                    <input id="trabIdUsuario" type="number" placeholder="ID Usuario opcional">
                    <button id="btnRegistrarTrabajador">Registrar</button>
                `)}

                ${card('Buscar trabajador por ID', `
                    <input id="buscarTrabajadorId" type="number" placeholder="ID Trabajador">
                    <button id="btnBuscarTrabajador">Buscar</button>
                `)}

                ${card('Trabajadores con transportes', `
                    <button id="btnTrabajadoresTransportes">Ver asignaciones</button>
                    <div id="tablaTrabajadoresTransportes"></div>
                `)}

                ${card('Asignar trabajador a transporte', `
                    <input id="adminAsignarTrabajador" type="number" placeholder="ID Trabajador">
                    <input id="adminAsignarTransporte" type="number" placeholder="ID Transporte">
                    <input id="adminFechaAsignacion" type="date">
                    <button id="btnAdminAsignar">Asignar</button>
                `)}

                ${card('Desasignar trabajador de transporte', `
                    <input id="adminQuitarTrabajador" type="number" placeholder="ID Trabajador">
                    <input id="adminQuitarTransporte" type="number" placeholder="ID Transporte">
                    <button id="btnAdminQuitarAsignacion" class="danger">Desasignar</button>
                `)}

                ${card('Activar / desactivar trabajador', `
                    <input id="estadoTrabajadorId" type="number" placeholder="ID Trabajador">
                    <div class="actions">
                        <button id="btnActivarTrabajador" class="success">Activar</button>
                        <button id="btnDesactivarTrabajador" class="danger">Desactivar</button>
                    </div>
                `)}
            </section>
        `
    );

    document.getElementById('btnRegistrarTrabajador').addEventListener('click', async () => {
        try {
            const body = {
                Nombre: getValue('trabNombre'),
                Cedula: getValue('trabCedula'),
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

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnBuscarTrabajador').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/trabajadores/${getNumber('buscarTrabajadorId')}`);
            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnTrabajadoresTransportes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/trabajadores/transportes/asignados');
            setOutput(data);

            document.getElementById('tablaTrabajadoresTransportes').innerHTML = table(data.trabajadores || []);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnAdminAsignar').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/manejo/asignar', {
                method: 'POST',
                body: {
                    ID_Trabajador: getNumber('adminAsignarTrabajador'),
                    ID_Transporte: getNumber('adminAsignarTransporte'),
                    FechaAsignacion: getValue('adminFechaAsignacion') || null
                }
            });
            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnAdminQuitarAsignacion').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/manejo/quitar', {
                method: 'DELETE',
                body: {
                    ID_Trabajador: getNumber('adminQuitarTrabajador'),
                    ID_Transporte: getNumber('adminQuitarTransporte')
                }
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnActivarTrabajador').addEventListener('click', () => cambiarEstadoTrabajador('activar'));
    document.getElementById('btnDesactivarTrabajador').addEventListener('click', () => cambiarEstadoTrabajador('desactivar'));
}

async function cambiarEstadoTrabajador(accion) {
    try {
        const data = await apiRequest(`/api/trabajadores/${getNumber('estadoTrabajadorId')}/${accion}`, {
            method: 'PUT'
        });

        setOutput(data);
    } catch (error) {
        showError(error);
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
                    <button id="btnRegistrarTransporte">Registrar</button>
                `)}

                ${card('Listar transportes activos', `
                    <button id="btnTransportesActivos">Listar activos</button>
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
                    <button id="btnActualizarTransporte">Actualizar</button>
                `)}

                ${card('Cambiar estado de transporte', `
                    <input id="estadoTransporteId" type="number" placeholder="ID Transporte">
                    <div class="actions">
                        <button id="btnAltaTransporte" class="success">Dar de alta</button>
                        <button id="btnBajaTransporte" class="danger">Dar de baja</button>
                        <button id="btnMantenimientoTransporte" class="warning">Mantenimiento</button>
                    </div>
                `)}
            </section>
        `
    );

    document.getElementById('btnRegistrarTransporte').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/transportes', {
                method: 'POST',
                body: {
                    Placa: getValue('transPlaca'),
                    Capacidad: getNumber('transCapacidad'),
                    Costo: getNumber('transCosto'),
                    Estado: 'activo'
                }
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnTransportesActivos').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/transportes/activos');
            setOutput(data);

            const rows = data.transportes || data;
            document.getElementById('tablaTransportesActivos').innerHTML = table(rows);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnActualizarTransporte').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/transportes/${getNumber('actualizarTransporteId')}`, {
                method: 'PUT',
                body: {
                    Placa: getValue('actualizarPlaca'),
                    Capacidad: getNumber('actualizarCapacidad'),
                    Costo: getNumber('actualizarCosto'),
                    Estado: getValue('actualizarEstado')
                }
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnAltaTransporte').addEventListener('click', () => cambiarEstadoTransporte('alta'));
    document.getElementById('btnBajaTransporte').addEventListener('click', () => cambiarEstadoTransporte('baja'));
    document.getElementById('btnMantenimientoTransporte').addEventListener('click', () => cambiarEstadoTransporte('mantenimiento'));
}

async function cambiarEstadoTransporte(accion) {
    try {
        const data = await apiRequest(`/api/transportes/${getNumber('estadoTransporteId')}/${accion}`, {
            method: 'PUT'
        });

        setOutput(data);
    } catch (error) {
        showError(error);
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
                    <button id="btnViajesUsuario">Consultar</button>
                    <div id="tablaViajesUsuario"></div>
                `)}

                ${card('Viajes por transporte', `
                    <input id="viajesTransporteId" type="number" placeholder="ID Transporte">
                    <button id="btnViajesTransporte">Consultar</button>
                    <div id="tablaViajesTransporte"></div>
                `)}

                ${card('Viajes de transporte por fechas', `
                    <input id="rangoTransporteId" type="number" placeholder="ID Transporte">
                    <input id="fechaInicio" type="date">
                    <input id="fechaFin" type="date">
                    <button id="btnViajesRango">Consultar rango</button>
                    <div id="tablaViajesRango"></div>
                `)}
            </section>
        `
    );

    document.getElementById('btnViajesUsuario').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/viajes/usuario/${getNumber('viajesUsuarioId')}`);
            setOutput(data);
            document.getElementById('tablaViajesUsuario').innerHTML = table(data.viajes || data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnViajesTransporte').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/viajes/transporte/${getNumber('viajesTransporteId')}`);
            setOutput(data);
            document.getElementById('tablaViajesTransporte').innerHTML = table(data.viajes || data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnViajesRango').addEventListener('click', async () => {
        try {
            const query = buildQuery({
                fechaInicio: getValue('fechaInicio'),
                fechaFin: getValue('fechaFin')
            });

            const data = await apiRequest(`/api/viajes/transporte/${getNumber('rangoTransporteId')}/fechas?${query}`);
            setOutput(data);
            document.getElementById('tablaViajesRango').innerHTML = table(data.viajes || data);
        } catch (error) {
            showError(error);
        }
    });
}

function reportesAdmin() {
    setPage(
        'Reportes',
        'Consulta reportes operativos del sistema',
        `
            <section class="module-card">
                <div class="actions">
                    <button id="repResumen">Resumen general</button>
                    <button id="repRecargas">Recargas por día</button>
                    <button id="repTarjetas">Tarjetas por estado</button>
                    <button id="repPagos">Pagos por día</button>
                    <button id="repViajes">Viajes por día</button>
                    <button id="repTransportes">Transportes más usados</button>
                </div>
            </section>
        `
    );

    const load = async (endpoint) => {
        try {
            const data = await apiRequest(endpoint);
            setOutput(data);
        } catch (error) {
            showError(error);
        }
    };

    document.getElementById('repResumen').addEventListener('click', () => load('/api/reportes/resumen-general'));
    document.getElementById('repRecargas').addEventListener('click', () => load('/api/reportes/recargas-dia'));
    document.getElementById('repTarjetas').addEventListener('click', () => load('/api/reportes/tarjetas-estado'));
    document.getElementById('repPagos').addEventListener('click', () => load('/api/reportes/pagos-dia'));
    document.getElementById('repViajes').addEventListener('click', () => load('/api/reportes/viajes-dia'));
    document.getElementById('repTransportes').addEventListener('click', () => load('/api/reportes/transportes-mas-usados'));
}
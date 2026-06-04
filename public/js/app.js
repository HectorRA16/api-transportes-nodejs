import { apiRequest } from './api.js';
import { login, usuarioActual, obtenerRol } from './auth.js';
import { renderLogin, renderDashboard, setContent, setTitle, showResult, showError } from './ui.js';

const app = document.getElementById('app');

document.addEventListener('DOMContentLoaded', () => {
    const usuario = usuarioActual();

    if (!usuario) {
        renderLogin();
        configurarLogin();
    } else {
        renderDashboard();
        cargarVistaInicial();
        configurarMenu();
    }
});

function configurarLogin() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorBox = document.getElementById('loginError');

        try {
            await login(email, password);
            location.reload();
        } catch (error) {
            errorBox.classList.remove('hidden');
            errorBox.textContent = error.mensaje || error.error || 'Error al iniciar sesión';
        }
    });
}

function configurarMenu() {
    document.querySelectorAll('.menu-item').forEach(button => {
        button.addEventListener('click', () => {
            cargarVista(button.dataset.view);
        });
    });
}

function cargarVistaInicial() {
    const rol = obtenerRol();

    if (rol === 'usuario') cargarVista('usuarioInicio');
    if (rol === 'trabajador') cargarVista('trabajadorInicio');
    if (rol === 'admin') cargarVista('adminInicio');
}

function cargarVista(view) {
    const vistas = {
        usuarioInicio,
        crearTarjeta,
        misTarjetas,
        misViajes,
        estadoTarjeta,
        trabajadorInicio,
        cobrarViaje,
        asignarTransporte,
        crearTransporte,
        transportes,
        adminInicio,
        crearUsuario,
        reportes
    };

    if (vistas[view]) {
        vistas[view]();
    }
}

function usuarioInicio() {
    setTitle('Panel de usuario');

    setContent(`
        <div class="welcome-card">
            <h2>Bienvenido</h2>
            <p>Desde aquí puedes administrar tus tarjetas, consultar tus viajes y bloquear tus tarjetas en caso de pérdida.</p>
        </div>
    `);
}

function trabajadorInicio() {
    setTitle('Panel de trabajador');

    setContent(`
        <div class="welcome-card">
            <h2>Área de trabajador</h2>
            <p>Desde aquí puedes generar cobros de viaje, asignar transportes y registrar unidades.</p>
        </div>
    `);
}

function adminInicio() {
    setTitle('Panel de administrador');

    setContent(`
        <div class="welcome-card">
            <h2>Administración general</h2>
            <p>Acceso a reportes, usuarios, transportes y administración del sistema.</p>
        </div>
    `);
}

function crearTarjeta() {
    setTitle('Dar de alta tarjeta');

    setContent(`
        <form id="formCrearTarjeta" class="module-card">
            <h2>Nueva tarjeta</h2>

            <label>Número de tarjeta</label>
            <input id="numTarjeta" placeholder="16 dígitos">

            <label>NFC ID</label>
            <input id="nfcId" placeholder="Ejemplo: NFC-001">

            <label>Saldo inicial</label>
            <input id="saldo" type="number" value="0">

            <button type="submit">Crear tarjeta</button>
        </form>
    `);

    document.getElementById('formCrearTarjeta').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/tarjetas', 'POST', {
                Num_Tarjeta: document.getElementById('numTarjeta').value,
                NFC_ID: document.getElementById('nfcId').value,
                Saldo: Number(document.getElementById('saldo').value),
                Estado: 'activa'
            });

            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function misTarjetas() {
    setTitle('Mis tarjetas');

    setContent(`
        <div class="module-card">
            <h2>Consultar tarjetas</h2>
            <button id="btnMisTarjetas">Cargar mis tarjetas</button>
            <div id="tablaTarjetas"></div>
        </div>
    `);

    document.getElementById('btnMisTarjetas').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/tarjetas/mis-tarjetas');
            showResult(data);

            const tarjetas = data.tarjetas || data;

            document.getElementById('tablaTarjetas').innerHTML = crearTabla(tarjetas);
        } catch (error) {
            showError(error);
        }
    });
}

function estadoTarjeta() {
    setTitle('Bloquear / desbloquear tarjeta');

    setContent(`
        <div class="module-card">
            <h2>Estado de tarjeta</h2>

            <label>ID de tarjeta</label>
            <input id="idTarjetaEstado" type="number" placeholder="Ejemplo: 1">

            <div class="actions">
                <button id="btnBloquear" class="danger">Bloquear</button>
                <button id="btnDesbloquear" class="success">Desbloquear</button>
            </div>
        </div>
    `);

    document.getElementById('btnBloquear').addEventListener('click', async () => {
        try {
            const id = document.getElementById('idTarjetaEstado').value;
            const data = await apiRequest(`/api/tarjetas/${id}/bloquear`, 'PUT');
            showResult(data);
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('btnDesbloquear').addEventListener('click', async () => {
        try {
            const id = document.getElementById('idTarjetaEstado').value;
            const data = await apiRequest(`/api/tarjetas/${id}/desbloquear`, 'PUT');
            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function misViajes() {
    setTitle('Mis viajes');

    setContent(`
        <div class="module-card">
            <h2>Historial de viajes</h2>
            <button id="btnMisViajes">Cargar mis viajes</button>
            <div id="tablaViajes"></div>
        </div>
    `);

    document.getElementById('btnMisViajes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/viajes/mis-viajes');
            showResult(data);

            const viajes = data.viajes || data;
            document.getElementById('tablaViajes').innerHTML = crearTabla(viajes);
        } catch (error) {
            showError(error);
        }
    });
}

function cobrarViaje() {
    setTitle('Generar cobro de viaje');

    setContent(`
        <form id="formCobroViaje" class="module-card">
            <h2>Cobrar viaje con NFC</h2>

            <label>NFC ID de la tarjeta</label>
            <input id="nfcCobro" placeholder="Ejemplo: NFC-001">

            <label>ID del transporte</label>
            <input id="idTransporteCobro" type="number" placeholder="Ejemplo: 1">

            <label>Parada inicio</label>
            <input id="paradaInicio" placeholder="Centro">

            <label>Parada fin</label>
            <input id="paradaFin" placeholder="Escuela">

            <label>Duración en minutos</label>
            <input id="duracion" type="number" value="10">

            <button type="submit">Generar cobro</button>
        </form>
    `);

    document.getElementById('formCobroViaje').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/pagos/cobrar', 'POST', {
                NFC_ID: document.getElementById('nfcCobro').value,
                ID_Transporte: Number(document.getElementById('idTransporteCobro').value),
                parada_inicio: document.getElementById('paradaInicio').value,
                parada_fin: document.getElementById('paradaFin').value,
                duracion_min: Number(document.getElementById('duracion').value)
            });

            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function asignarTransporte() {
    setTitle('Asignar transporte');

    setContent(`
        <form id="formAsignarTransporte" class="module-card">
            <h2>Asignar transporte a trabajador</h2>

            <label>ID trabajador</label>
            <input id="idTrabajador" type="number">

            <label>ID transporte</label>
            <input id="idTransporte" type="number">

            <label>Fecha de asignación</label>
            <input id="fechaAsignacion" type="date">

            <button type="submit">Asignar transporte</button>
        </form>
    `);

    document.getElementById('formAsignarTransporte').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/manejo/asignar', 'POST', {
                ID_Trabajador: Number(document.getElementById('idTrabajador').value),
                ID_Transporte: Number(document.getElementById('idTransporte').value),
                FechaAsignacion: document.getElementById('fechaAsignacion').value
            });

            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function crearTransporte() {
    setTitle('Dar de alta transporte');

    setContent(`
        <form id="formCrearTransporte" class="module-card">
            <h2>Nuevo transporte</h2>

            <label>Placa</label>
            <input id="placa" placeholder="ABC123">

            <label>Capacidad</label>
            <input id="capacidad" type="number">

            <label>Costo</label>
            <input id="costo" type="number" step="0.01">

            <button type="submit">Crear transporte</button>
        </form>
    `);

    document.getElementById('formCrearTransporte').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/transportes', 'POST', {
                Placa: document.getElementById('placa').value,
                Capacidad: Number(document.getElementById('capacidad').value),
                Costo: Number(document.getElementById('costo').value),
                Estado: 'activo'
            });

            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function transportes() {
    setTitle('Transportes');

    setContent(`
        <div class="module-card">
            <h2>Listado de transportes</h2>
            <button id="btnTransportes">Cargar transportes</button>
            <div id="tablaTransportes"></div>
        </div>
    `);

    document.getElementById('btnTransportes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/transportes');
            showResult(data);

            const transportes = data.transportes || data;
            document.getElementById('tablaTransportes').innerHTML = crearTabla(transportes);
        } catch (error) {
            showError(error);
        }
    });
}

function crearUsuario() {
    setTitle('Crear usuario');

    setContent(`
        <form id="formCrearUsuario" class="module-card">
            <h2>Nuevo usuario</h2>

            <label>Nombre</label>
            <input id="nombreUsuario">

            <label>Email</label>
            <input id="emailUsuario" type="email">

            <label>Password</label>
            <input id="passwordUsuario" type="password">

            <label>Teléfono</label>
            <input id="telefonoUsuario">

            <label>Rol</label>
            <select id="rolUsuario">
                <option value="usuario">usuario</option>
                <option value="trabajador">trabajador</option>
                <option value="admin">admin</option>
            </select>

            <button type="submit">Crear usuario</button>
        </form>
    `);

    document.getElementById('formCrearUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/usuarios', 'POST', {
                Nombre: document.getElementById('nombreUsuario').value,
                Email: document.getElementById('emailUsuario').value,
                Password: document.getElementById('passwordUsuario').value,
                Telefono: document.getElementById('telefonoUsuario').value,
                Rol: document.getElementById('rolUsuario').value
            });

            showResult(data);
        } catch (error) {
            showError(error);
        }
    });
}

function reportes() {
    setTitle('Reportes');

    setContent(`
        <div class="module-card">
            <h2>Reportes generales</h2>

            <div class="actions">
                <button id="btnResumen">Resumen general</button>
                <button id="btnTarjetasEstado">Tarjetas por estado</button>
                <button id="btnViajesDia">Viajes por día</button>
                <button id="btnPagosDia">Pagos por día</button>
                <button id="btnRecargasDia">Recargas por día</button>
                <button id="btnTransportesUsados">Transportes más usados</button>
            </div>
        </div>
    `);

    const cargarReporte = async (endpoint) => {
        try {
            const data = await apiRequest(endpoint);
            showResult(data);
        } catch (error) {
            showError(error);
        }
    };

    document.getElementById('btnResumen').addEventListener('click', () => cargarReporte('/api/reportes/resumen-general'));
    document.getElementById('btnTarjetasEstado').addEventListener('click', () => cargarReporte('/api/reportes/tarjetas-estado'));
    document.getElementById('btnViajesDia').addEventListener('click', () => cargarReporte('/api/reportes/viajes-dia'));
    document.getElementById('btnPagosDia').addEventListener('click', () => cargarReporte('/api/reportes/pagos-dia'));
    document.getElementById('btnRecargasDia').addEventListener('click', () => cargarReporte('/api/reportes/recargas-dia'));
    document.getElementById('btnTransportesUsados').addEventListener('click', () => cargarReporte('/api/reportes/transportes-mas-usados'));
}

function crearTabla(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '<p class="empty">No hay registros para mostrar.</p>';
    }

    const keys = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');

    return `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        ${keys.map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${keys.map(key => `<td>${row[key] ?? ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
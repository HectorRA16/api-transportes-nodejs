import { apiRequest } from '../api.js';
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

export const trabajadorMenu = [
    { id: 'trabajadorInicio', label: 'Inicio', icon: '🏠' },
    { id: 'asignarTransporte', label: 'Asignar transporte', icon: '🔗' },
    { id: 'quitarTransporte', label: 'Quitar asignación', icon: '✂️' },
    { id: 'cobrarViaje', label: 'Cobrar viaje', icon: '💳' },
    { id: 'cobrosTransporte', label: 'Cobros por transporte', icon: '📄' },
    { id: 'mantenimientoTransporte', label: 'Mantenimiento', icon: '🛠️' }
];

export function renderTrabajadorView(view) {
    const views = {
        trabajadorInicio,
        asignarTransporte,
        quitarTransporte,
        cobrarViaje,
        cobrosTransporte,
        mantenimientoTransporte
    };

    views[view]?.();
}

function trabajadorInicio() {
    setPage(
        'Panel de trabajador',
        'Operaciones de transporte, cobros y asignaciones',
        `
            <section class="dashboard-grid">
                ${card('Cobro de viajes', '<p>Registra cobros de viaje usando NFC y transporte.</p>')}
                ${card('Asignaciones', '<p>Asigna o quita trabajadores de unidades de transporte.</p>')}
                ${card('Mantenimiento', '<p>Cambia el estado de una unidad cuando requiera revisión.</p>')}
            </section>
        `
    );
}

function asignarTransporte() {
    setPage(
        'Asignar transporte a trabajador',
        'Relaciona un trabajador con una unidad de transporte existente',
        `
            <form id="formAsignar" class="module-card form-grid">
                <label>ID Trabajador</label>
                <input id="asignarTrabajador" type="number" placeholder="Ejemplo: 1" required>

                <label>ID Transporte</label>
                <input id="asignarTransporte" type="number" placeholder="Ejemplo: 1" required>

                <label>Fecha de asignación</label>
                <input id="fechaAsignacion" type="date">

                <button type="submit">Asignar transporte</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formAsignar').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const body = {
                ID_Trabajador: getNumber('asignarTrabajador'),
                ID_Transporte: getNumber('asignarTransporte'),
                FechaAsignacion: getValue('fechaAsignacion') || null
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
            });

        } catch (error) {
            showError(error);
        }
    });
}

function quitarTransporte() {
    setPage(
        'Quitar trabajador del transporte',
        'Elimina una asignación existente entre trabajador y transporte',
        `
            <form id="formQuitar" class="module-card form-grid">
                <label>ID Trabajador</label>
                <input id="quitarTrabajador" type="number" placeholder="Ejemplo: 1" required>

                <label>ID Transporte</label>
                <input id="quitarTransporte" type="number" placeholder="Ejemplo: 1" required>

                <button type="submit" class="danger">Quitar asignación</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formQuitar').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const body = {
                ID_Trabajador: getNumber('quitarTrabajador'),
                ID_Transporte: getNumber('quitarTransporte')
            };

            const data = await apiRequest('/api/manejo/quitar', {
                method: 'DELETE',
                body
            });

            showSuccess('Asignación eliminada correctamente', {
                ID_Trabajador: body.ID_Trabajador,
                ID_Transporte: body.ID_Transporte,
                Mensaje: data.mensaje
            });

        } catch (error) {
            showError(error);
        }
    });
}

function cobrarViaje() {
    setPage(
        'Cobrar viaje',
        'Genera un viaje y registra su pago mediante NFC',
        `
            <form id="formCobrar" class="module-card form-grid">
                <label>NFC ID</label>
                <input id="cobroNfc" placeholder="Ejemplo: NFC-001" required>

                <label>ID Transporte</label>
                <input id="cobroTransporte" type="number" placeholder="Ejemplo: 1" required>

                <label>Parada inicio</label>
                <input id="paradaInicio" placeholder="Ejemplo: Centro">

                <label>Parada fin</label>
                <input id="paradaFin" placeholder="Ejemplo: Escuela">

                <label>Duración en minutos</label>
                <input id="duracionMin" type="number" value="10">

                <button type="submit">Generar cobro</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formCobrar').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/pagos/cobrar', {
                method: 'POST',
                body: {
                    NFC_ID: getValue('cobroNfc'),
                    ID_Transporte: getNumber('cobroTransporte'),
                    parada_inicio: getValue('paradaInicio'),
                    parada_fin: getValue('paradaFin'),
                    duracion_min: getNumber('duracionMin')
                }
            });

            const viaje = data.viaje || {};
            const pago = data.pago || {};

            showSuccess('Cobro de viaje realizado correctamente', {
                Folio_Viaje: viaje.ID_Viaje || pago.ID_Viaje_Numero,
                ID_Transporte: viaje.ID_Transporte,
                ID_Usuario: viaje.ID_Usuario,
                ID_Tarjeta: pago.Id_Tarjeta,
                Monto: pago.Monto,
                Saldo_Antes: pago.Saldo_Antes,
                Saldo_Despues: pago.Saldo_Despues,
                Estado: viaje.Estado
            });

        } catch (error) {
            showError(error);
        }
    });
}

function cobrosTransporte() {
    setPage(
        'Cobros realizados por transporte',
        'Consulta los pagos registrados por una unidad de transporte',
        `
            <section class="module-card">
                <label>ID Transporte</label>
                <input id="cobrosIdTransporte" type="number" placeholder="Ejemplo: 1">

                <button id="btnCobrosTransporte">Consultar cobros</button>

                ${resultBox()}

                <div id="tablaCobros"></div>
            </section>
        `
    );

    document.getElementById('btnCobrosTransporte').addEventListener('click', async () => {
        try {
            const id = getNumber('cobrosIdTransporte');
            const data = await apiRequest(`/api/pagos/transporte/${id}`);

            const rows = data.cobros || data.pagos || data;

            showSuccess('Cobros del transporte consultados', {
                ID_Transporte: id,
                Total_Cobros: Array.isArray(rows) ? rows.length : data.total
            });

            document.getElementById('tablaCobros').innerHTML = table(rows);

        } catch (error) {
            showError(error);
        }
    });
}

function mantenimientoTransporte() {
    setPage(
        'Poner transporte en mantenimiento',
        'Cambia el estado de una unidad a mantenimiento',
        `
            <form id="formMantenimiento" class="module-card form-grid">
                <label>ID Transporte</label>
                <input id="mantenimientoId" type="number" placeholder="Ejemplo: 1" required>

                <button type="submit" class="warning">Poner en mantenimiento</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formMantenimiento').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const id = getNumber('mantenimientoId');

            const data = await apiRequest(`/api/transportes/${id}/mantenimiento`, {
                method: 'PUT'
            });

            showSuccess('Transporte puesto en mantenimiento', {
                ID_Transporte: id,
                Estado: 'mantenimiento',
                Mensaje: data.mensaje
            });

        } catch (error) {
            showError(error);
        }
    });
}
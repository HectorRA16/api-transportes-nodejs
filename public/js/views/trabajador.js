import { apiRequest } from '../api.js';
import { setPage, setOutput, showError, getValue, getNumber, table, card } from '../components.js';

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
                ${card('Cobro de viajes', '<p>Registra el cobro de un viaje mediante NFC y transporte asignado.</p>')}
                ${card('Asignaciones', '<p>Asigna o retira trabajadores de transportes registrados.</p>')}
                ${card('Mantenimiento', '<p>Cambia el estado de un transporte a mantenimiento cuando sea necesario.</p>')}
            </section>
        `
    );
}

function asignarTransporte() {
    setPage(
        'Asignar transporte a trabajador',
        'Relaciona un trabajador con una unidad de transporte',
        `
            <form id="formAsignar" class="module-card form-grid">
                <label>ID Trabajador</label>
                <input id="asignarTrabajador" type="number" required>

                <label>ID Transporte</label>
                <input id="asignarTransporte" type="number" required>

                <label>Fecha de asignación</label>
                <input id="fechaAsignacion" type="date">

                <button type="submit">Asignar transporte</button>
            </form>
        `
    );

    document.getElementById('formAsignar').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/manejo/asignar', {
                method: 'POST',
                body: {
                    ID_Trabajador: getNumber('asignarTrabajador'),
                    ID_Transporte: getNumber('asignarTransporte'),
                    FechaAsignacion: getValue('fechaAsignacion') || null
                }
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });
}

function quitarTransporte() {
    setPage(
        'Quitar trabajador del transporte',
        'Elimina una relación de manejo entre trabajador y transporte',
        `
            <form id="formQuitar" class="module-card form-grid">
                <label>ID Trabajador</label>
                <input id="quitarTrabajador" type="number" required>

                <label>ID Transporte</label>
                <input id="quitarTransporte" type="number" required>

                <button type="submit" class="danger">Quitar asignación</button>
            </form>
        `
    );

    document.getElementById('formQuitar').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/manejo/quitar', {
                method: 'DELETE',
                body: {
                    ID_Trabajador: getNumber('quitarTrabajador'),
                    ID_Transporte: getNumber('quitarTransporte')
                }
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });
}

function cobrarViaje() {
    setPage(
        'Cobrar viaje',
        'Genera un viaje y su cobro usando NFC',
        `
            <form id="formCobrar" class="module-card form-grid">
                <label>NFC ID</label>
                <input id="cobroNfc" required>

                <label>ID Transporte</label>
                <input id="cobroTransporte" type="number" required>

                <label>Parada inicio</label>
                <input id="paradaInicio">

                <label>Parada fin</label>
                <input id="paradaFin">

                <label>Duración en minutos</label>
                <input id="duracionMin" type="number" value="10">

                <button type="submit">Generar cobro</button>
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

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });
}

function cobrosTransporte() {
    setPage(
        'Cobros realizados por transporte',
        'Consulta los cobros registrados por unidad',
        `
            <section class="module-card">
                <label>ID Transporte</label>
                <input id="cobrosIdTransporte" type="number">

                <button id="btnCobrosTransporte">Consultar cobros</button>

                <div id="tablaCobros"></div>
            </section>
        `
    );

    document.getElementById('btnCobrosTransporte').addEventListener('click', async () => {
        try {
            const id = getNumber('cobrosIdTransporte');
            const data = await apiRequest(`/api/pagos/transporte/${id}`);
            setOutput(data);

            const rows = Array.isArray(data) ? data : data.cobros || [];
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
                <input id="mantenimientoId" type="number" required>

                <button type="submit" class="warning">Poner en mantenimiento</button>
            </form>
        `
    );

    document.getElementById('formMantenimiento').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest(`/api/transportes/${getNumber('mantenimientoId')}/mantenimiento`, {
                method: 'PUT'
            });

            setOutput(data);
        } catch (error) {
            showError(error);
        }
    });
}
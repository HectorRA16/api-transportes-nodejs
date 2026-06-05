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

export const usuarioMenu = [
    { id: 'usuarioInicio', label: 'Inicio', icon: '🏠' },
    { id: 'historialCobrosTarjeta', label: 'Cobros de tarjeta', icon: '📄' },
    { id: 'recargarTarjeta', label: 'Recargar saldo', icon: '💰' },
    { id: 'historialRecargas', label: 'Historial recargas', icon: '🧾' },
    { id: 'saldoNfc', label: 'Saldo por NFC', icon: '📡' },
    { id: 'crearTarjeta', label: 'Crear tarjeta', icon: '💳' },
    { id: 'estadoTarjeta', label: 'Bloquear / desbloquear', icon: '🔐' },
    { id: 'crearViaje', label: 'Crear viaje', icon: '🚌' },
    { id: 'viajesRecientes', label: 'Viajes recientes', icon: '🕒' }
];

export function renderUsuarioView(view) {
    const views = {
        usuarioInicio,
        historialCobrosTarjeta,
        recargarTarjeta,
        historialRecargas,
        saldoNfc,
        crearTarjeta,
        estadoTarjeta,
        crearViaje,
        viajesRecientes
    };

    views[view]?.();
}

function usuarioInicio() {
    setPage(
        'Panel de usuario',
        'Consulta tarjetas, recargas, viajes y saldo',
        `
            <section class="dashboard-grid">
                ${card('Tarjetas', '<p>Registra tarjetas, consulta saldo por NFC y administra bloqueos.</p>')}
                ${card('Recargas', '<p>Recarga saldo y consulta el historial de movimientos.</p>')}
                ${card('Viajes', '<p>Crea viajes y consulta tus viajes recientes.</p>')}
            </section>
        `
    );
}

function historialCobrosTarjeta() {
    setPage(
        'Historial de cobros de una tarjeta',
        'Consulta los pagos realizados con una tarjeta',
        `
            <section class="module-card">
                <label>ID Tarjeta</label>
                <input id="historialPagoTarjeta" type="number" placeholder="Ejemplo: 1">

                <button id="btnHistorialPago">Consultar historial</button>

                ${resultBox()}

                <div id="tablaHistorialPago"></div>
            </section>
        `
    );

    document.getElementById('btnHistorialPago').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/pagos/tarjeta/${getNumber('historialPagoTarjeta')}`);

            const rows = data.pagos || data;

            showSuccess('Historial de cobros consultado', {
                ID_Tarjeta: data.Id_Tarjeta || getNumber('historialPagoTarjeta'),
                Total_Cobros: Array.isArray(rows) ? rows.length : data.total
            });

            document.getElementById('tablaHistorialPago').innerHTML = table(rows);

        } catch (error) {
            showError(error);
        }
    });
}

function recargarTarjeta() {
    setPage(
        'Recargar saldo a tarjeta',
        'Agrega saldo a una tarjeta registrada',
        `
            <form id="formRecarga" class="module-card form-grid">
                <label>ID Tarjeta</label>
                <input id="recargaTarjeta" type="number" placeholder="Ejemplo: 1" required>

                <label>Monto</label>
                <input id="recargaMonto" type="number" step="0.01" placeholder="Ejemplo: 100" required>

                <label>Método</label>
                <select id="recargaMetodo">
                    <option value="efectivo">efectivo</option>
                    <option value="transferencia">transferencia</option>
                    <option value="terminal">terminal</option>
                </select>

                <button type="submit">Recargar</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formRecarga').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/recargas', {
                method: 'POST',
                body: {
                    Id_Tarjeta: getNumber('recargaTarjeta'),
                    Monto: getNumber('recargaMonto'),
                    Metodo: getValue('recargaMetodo')
                }
            });

            showSuccess('Recarga realizada correctamente', data);

        } catch (error) {
            showError(error);
        }
    });
}

function historialRecargas() {
    setPage(
        'Historial de recargas',
        'Consulta las recargas realizadas a una tarjeta',
        `
            <section class="module-card">
                <label>ID Tarjeta</label>
                <input id="historialRecargaTarjeta" type="number" placeholder="Ejemplo: 1">

                <button id="btnHistorialRecargas">Consultar recargas</button>

                ${resultBox()}

                <div id="tablaHistorialRecargas"></div>
            </section>
        `
    );

    document.getElementById('btnHistorialRecargas').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/recargas/tarjeta/${getNumber('historialRecargaTarjeta')}`);

            const rows = data.recargas || data;

            showSuccess('Historial de recargas consultado', {
                ID_Tarjeta: getNumber('historialRecargaTarjeta'),
                Total_Recargas: Array.isArray(rows) ? rows.length : data.total
            });

            document.getElementById('tablaHistorialRecargas').innerHTML = table(rows);

        } catch (error) {
            showError(error);
        }
    });
}

function saldoNfc() {
    setPage(
        'Consultar saldo por NFC',
        'Obtén el saldo de una tarjeta usando su NFC_ID',
        `
            <section class="module-card">
                <label>NFC ID</label>
                <input id="saldoNfcId" placeholder="Ejemplo: NFC-001">

                <button id="btnSaldoNfc">Consultar saldo</button>

                ${resultBox()}
            </section>
        `
    );

    document.getElementById('btnSaldoNfc').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/tarjetas/nfc/${getValue('saldoNfcId')}/saldo`);

            showSuccess('Saldo consultado correctamente', data);

        } catch (error) {
            showError(error);
        }
    });
}

function crearTarjeta() {
    setPage(
        'Crear tarjeta',
        'Registra una nueva tarjeta para el usuario autenticado',
        `
            <form id="formCrearTarjeta" class="module-card form-grid">
                <label>Número de tarjeta</label>
                <input id="numTarjeta" maxlength="16" placeholder="16 dígitos" required>

                <label>NFC ID</label>
                <input id="nfcId" placeholder="Ejemplo: NFC-001" required>

                <label>Saldo inicial</label>
                <input id="saldoInicial" type="number" step="0.01" value="0">

                <button type="submit">Crear tarjeta</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formCrearTarjeta').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/tarjetas', {
                method: 'POST',
                body: {
                    Num_Tarjeta: getValue('numTarjeta'),
                    NFC_ID: getValue('nfcId'),
                    Saldo: getNumber('saldoInicial'),
                    Estado: 'activa'
                }
            });

            showSuccess('Tarjeta creada correctamente', data);

        } catch (error) {
            showError(error);
        }
    });
}

function estadoTarjeta() {
    setPage(
        'Bloquear o desbloquear tarjeta',
        'Cambia el estado de una tarjeta',
        `
            <section class="module-card">
                <label>ID Tarjeta</label>
                <input id="estadoTarjetaId" type="number" placeholder="Ejemplo: 1">

                <div class="actions">
                    <button id="btnBloquear" class="danger">Bloquear</button>
                    <button id="btnDesbloquear" class="success">Desbloquear</button>
                </div>

                ${resultBox()}
            </section>
        `
    );

    document.getElementById('btnBloquear').addEventListener('click', async () => cambiarEstado('bloquear'));
    document.getElementById('btnDesbloquear').addEventListener('click', async () => cambiarEstado('desbloquear'));
}

async function cambiarEstado(accion) {
    try {
        const id = getNumber('estadoTarjetaId');

        const data = await apiRequest(`/api/tarjetas/${id}/${accion}`, {
            method: 'PUT'
        });

        const texto = accion === 'bloquear'
            ? 'Tarjeta bloqueada correctamente'
            : 'Tarjeta desbloqueada correctamente';

        showSuccess(texto, {
            ID_Tarjeta: id,
            Estado: accion === 'bloquear' ? 'bloqueada' : 'activa'
        });

    } catch (error) {
        showError(error);
    }
}

function crearViaje() {
    setPage(
        'Crear viaje',
        'Registra un viaje manual para el usuario autenticado',
        `
            <form id="formCrearViaje" class="module-card form-grid">
                <label>ID Transporte</label>
                <input id="viajeTransporte" type="number" placeholder="Ejemplo: 1" required>

                <label>Costo cobrado</label>
                <input id="viajeCosto" type="number" step="0.01" placeholder="Ejemplo: 12.50" required>

                <label>Parada inicio</label>
                <input id="viajeParadaInicio" placeholder="Ejemplo: Centro">

                <label>Parada fin</label>
                <input id="viajeParadaFin" placeholder="Ejemplo: Escuela">

                <label>Duración en minutos</label>
                <input id="viajeDuracion" type="number" value="10">

                <button type="submit">Crear viaje</button>

                ${resultBox()}
            </form>
        `
    );

    document.getElementById('formCrearViaje').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const data = await apiRequest('/api/viajes', {
                method: 'POST',
                body: {
                    ID_Transporte: getNumber('viajeTransporte'),
                    Costo_Cobrado: getNumber('viajeCosto'),
                    metadata: {
                        parada_inicio: getValue('viajeParadaInicio'),
                        parada_fin: getValue('viajeParadaFin'),
                        duracion_min: getNumber('viajeDuracion')
                    }
                }
            });

            const viaje = data.viaje || {};

            showSuccess('Viaje creado correctamente', {
                Folio_Viaje: viaje.ID_Viaje,
                ID_Usuario: viaje.ID_Usuario,
                ID_Transporte: viaje.ID_Transporte,
                Costo_Cobrado: viaje.Costo_Cobrado,
                Estado: viaje.Estado,
                Parada_Inicio: viaje.metadata?.parada_inicio,
                Parada_Fin: viaje.metadata?.parada_fin,
                Duracion_Minutos: viaje.metadata?.duracion_min
            });

        } catch (error) {
            showError(error);
        }
    });
}

function viajesRecientes() {
    setPage(
        'Mis viajes recientes',
        'Consulta tus últimos viajes registrados',
        `
            <section class="module-card">
                <button id="btnViajesRecientes">Cargar mis viajes recientes</button>

                ${resultBox()}

                <div id="tablaViajesRecientes"></div>
            </section>
        `
    );

    document.getElementById('btnViajesRecientes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/viajes/mis-recientes');

            const rows = data.viajes || [];

            showSuccess('Viajes recientes consultados', {
                ID_Usuario: data.ID_Usuario,
                Total_Viajes: data.total || rows.length
            });

            document.getElementById('tablaViajesRecientes').innerHTML = table(rows);

        } catch (error) {
            showError(error);
        }
    });
}
import { apiRequest } from '../api.js';
import { setPage, setOutput, showError, getValue, getNumber, table, card } from '../components.js';

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
                ${card('Viajes', '<p>Crea viajes y consulta viajes recientes.</p>')}
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
                <input id="historialPagoTarjeta" type="number">
                <button id="btnHistorialPago">Consultar historial</button>
                <div id="tablaHistorialPago"></div>
            </section>
        `
    );

    document.getElementById('btnHistorialPago').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/pagos/tarjeta/${getNumber('historialPagoTarjeta')}`);
            setOutput(data);

            const rows = data.pagos || data;
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
                <input id="recargaTarjeta" type="number" required>

                <label>Monto</label>
                <input id="recargaMonto" type="number" step="0.01" required>

                <label>Método</label>
                <select id="recargaMetodo">
                    <option value="efectivo">efectivo</option>
                    <option value="transferencia">transferencia</option>
                    <option value="terminal">terminal</option>
                </select>

                <button type="submit">Recargar</button>
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

            setOutput(data);
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
                <input id="historialRecargaTarjeta" type="number">

                <button id="btnHistorialRecargas">Consultar recargas</button>

                <div id="tablaHistorialRecargas"></div>
            </section>
        `
    );

    document.getElementById('btnHistorialRecargas').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/recargas/tarjeta/${getNumber('historialRecargaTarjeta')}`);
            setOutput(data);

            const rows = data.recargas || data;
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
                <input id="saldoNfcId">

                <button id="btnSaldoNfc">Consultar saldo</button>
            </section>
        `
    );

    document.getElementById('btnSaldoNfc').addEventListener('click', async () => {
        try {
            const data = await apiRequest(`/api/tarjetas/nfc/${getValue('saldoNfcId')}/saldo`);
            setOutput(data);
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
                <input id="numTarjeta" maxlength="16" required>

                <label>NFC ID</label>
                <input id="nfcId" required>

                <label>Saldo inicial</label>
                <input id="saldoInicial" type="number" step="0.01" value="0">

                <button type="submit">Crear tarjeta</button>
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

            setOutput(data);
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
                <input id="estadoTarjetaId" type="number">

                <div class="actions">
                    <button id="btnBloquear" class="danger">Bloquear</button>
                    <button id="btnDesbloquear" class="success">Desbloquear</button>
                </div>
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

        setOutput(data);
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
                <input id="viajeTransporte" type="number" required>

                <label>Costo cobrado</label>
                <input id="viajeCosto" type="number" step="0.01" required>

                <label>Parada inicio</label>
                <input id="viajeParadaInicio">

                <label>Parada fin</label>
                <input id="viajeParadaFin">

                <label>Duración en minutos</label>
                <input id="viajeDuracion" type="number" value="10">

                <button type="submit">Crear viaje</button>
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

            setOutput(data);
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
                <div id="tablaViajesRecientes"></div>
            </section>
        `
    );

    document.getElementById('btnViajesRecientes').addEventListener('click', async () => {
        try {
            const data = await apiRequest('/api/viajes/mis-recientes');
            setOutput(data);

            const rows = data.viajes || [];
            document.getElementById('tablaViajesRecientes').innerHTML = table(rows);
        } catch (error) {
            showError(error);
        }
    });
}
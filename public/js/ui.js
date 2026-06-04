import { logout, usuarioActual, obtenerRol } from './auth.js';

export function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <main class="login-page">
            <section class="login-card">
                <div class="brand">
                    <div class="brand-icon">🚌</div>
                    <h1>EZPay Transporte</h1>
                    <p>Sistema de pagos, tarjetas y viajes</p>
                </div>

                <form id="loginForm" class="form">
                    <label>Correo electrónico</label>
                    <input type="email" id="email" placeholder="usuario@correo.com" required>

                    <label>Contraseña</label>
                    <input type="password" id="password" placeholder="Contraseña" required>

                    <button type="submit">Iniciar sesión</button>
                </form>

                <div id="loginError" class="error-box hidden"></div>
            </section>
        </main>
    `;
}

export function renderDashboard() {
    const usuario = usuarioActual();
    const rol = obtenerRol();
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="layout">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <div class="brand-icon">🚌</div>
                    <h2>EZPay</h2>
                </div>

                <div class="user-box">
                    <strong>${usuario?.Nombre || 'Usuario'}</strong>
                    <span>${usuario?.Email || ''}</span>
                    <small>${rol}</small>
                </div>

                <nav id="menu" class="menu"></nav>

                <button id="btnLogout" class="logout-btn">Cerrar sesión</button>
            </aside>

            <main class="content">
                <section class="topbar">
                    <div>
                        <h1 id="pageTitle">Panel principal</h1>
                        <p>Administración del sistema de transporte</p>
                    </div>
                    <div class="status-pill">API conectada</div>
                </section>

                <section id="mainContent" class="panel-grid"></section>

                <section class="response-card">
                    <h2>Respuesta de la API</h2>
                    <pre id="resultado">Aquí aparecerán las respuestas...</pre>
                </section>
            </main>
        </div>
    `;

    document.getElementById('btnLogout').addEventListener('click', () => {
        logout();
        location.reload();
    });

    renderMenuByRole(rol);
}

function renderMenuByRole(rol) {
    const menu = document.getElementById('menu');

    let items = [];

    if (rol === 'usuario') {
        items = [
            { id: 'usuarioInicio', text: 'Inicio' },
            { id: 'crearTarjeta', text: 'Dar de alta tarjeta' },
            { id: 'misTarjetas', text: 'Mis tarjetas' },
            { id: 'misViajes', text: 'Mis viajes' },
            { id: 'estadoTarjeta', text: 'Bloquear / desbloquear' }
        ];
    }

    if (rol === 'trabajador') {
        items = [
            { id: 'trabajadorInicio', text: 'Inicio' },
            { id: 'cobrarViaje', text: 'Generar cobro de viaje' },
            { id: 'asignarTransporte', text: 'Asignar transporte' },
            { id: 'crearTransporte', text: 'Dar de alta transporte' },
            { id: 'transportes', text: 'Ver transportes' }
        ];
    }

    if (rol === 'admin') {
        items = [
            { id: 'adminInicio', text: 'Inicio' },
            { id: 'crearUsuario', text: 'Crear usuario' },
            { id: 'transportes', text: 'Transportes' },
            { id: 'crearTransporte', text: 'Nuevo transporte' },
            { id: 'reportes', text: 'Reportes' }
        ];
    }

    menu.innerHTML = items.map(item => `
        <button class="menu-item" data-view="${item.id}">
            ${item.text}
        </button>
    `).join('');
}

export function setTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

export function setContent(html) {
    document.getElementById('mainContent').innerHTML = html;
}

export function showResult(data) {
    document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
}

export function showError(error) {
    document.getElementById('resultado').textContent = JSON.stringify(error, null, 2);
}
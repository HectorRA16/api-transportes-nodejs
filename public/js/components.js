export function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <main class="login-page">
            <section class="login-card">
                <div class="login-brand">
                    <div class="brand-mark">🚌</div>
                    <h1>EZPay Transporte</h1>
                    <p>Acceso automático según tu rol</p>
                </div>

                <form id="loginForm" class="form">
                    <label>Correo electrónico</label>
                    <input id="email" type="email" placeholder="correo@ejemplo.com" required>

                    <label>Contraseña</label>
                    <input id="password" type="password" placeholder="Contraseña" required>

                    <button type="submit">Iniciar sesión</button>
                </form>

                <div id="loginError" class="alert error hidden"></div>
            </section>
        </main>
    `;
}

export function renderShell(usuario, menuItems) {
    const app = document.getElementById('app');
    const rol = usuario?.Rol || usuario?.rol || 'sin rol';

    app.innerHTML = `
        <div class="layout">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <div class="brand-mark small">🚌</div>
                    <div>
                        <h2>EZPay</h2>
                        <span>Transporte</span>
                    </div>
                </div>

                <section class="profile-card">
                    <strong>${usuario?.Nombre || 'Usuario'}</strong>
                    <span>${usuario?.Email || usuario?.Cedula || ''}</span>
                    <small>${rol}</small>
                </section>

                <nav class="menu">
                    ${menuItems.map(item => `
                        <button class="menu-item" data-view="${item.id}">
                            <span>${item.icon}</span>
                            ${item.label}
                        </button>
                    `).join('')}
                </nav>

                <button id="logoutBtn" class="logout-btn">Cerrar sesión</button>
            </aside>

            <main class="content">
                <header class="topbar">
                    <div>
                        <h1 id="pageTitle">Panel principal</h1>
                        <p id="pageSubtitle">Sistema conectado a MySQL Railway y MongoDB Atlas</p>
                    </div>
                    <div class="api-status">API en línea</div>
                </header>

                <section id="mainContent" class="main-content"></section>

                <section class="response-panel">
                    <div class="response-header">
                        <h2>Respuesta de la API</h2>
                        <button id="clearOutputBtn" class="secondary small-btn">Limpiar</button>
                    </div>
                    <pre id="output">Aquí aparecerán las respuestas de las peticiones.</pre>
                </section>
            </main>
        </div>
    `;

    document.getElementById('clearOutputBtn').addEventListener('click', () => {
        setOutput('Aquí aparecerán las respuestas de las peticiones.');
    });
}

export function setPage(title, subtitle, html) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;
    document.getElementById('mainContent').innerHTML = html;
}

export function setOutput(data) {
    const output = document.getElementById('output');

    if (typeof data === 'string') {
        output.textContent = data;
        return;
    }

    output.textContent = JSON.stringify(data, null, 2);
}

export function showError(error) {
    setOutput(error);
}

export function getValue(id) {
    return document.getElementById(id)?.value?.trim();
}

export function getNumber(id) {
    const value = document.getElementById(id)?.value;
    return value === '' || value === undefined ? null : Number(value);
}

export function table(data) {
    const rows = Array.isArray(data) ? data : [];

    if (rows.length === 0) {
        return `<p class="empty">No hay registros para mostrar.</p>`;
    }

    const keys = Object.keys(rows[0]).filter(key => typeof rows[0][key] !== 'object');

    return `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        ${keys.map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${keys.map(key => `<td>${row[key] ?? ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function card(title, body) {
    return `
        <article class="module-card">
            <h2>${title}</h2>
            ${body}
        </article>
    `;
}
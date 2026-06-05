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
            </main>
        </div>

        <div id="toastContainer" class="toast-container"></div>
    `;
}

export function setPage(title, subtitle, html) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;
    document.getElementById('mainContent').innerHTML = html;
}

export function getValue(id) {
    return document.getElementById(id)?.value?.trim();
}

export function getNumber(id) {
    const value = document.getElementById(id)?.value;
    return value === '' || value === undefined ? null : Number(value);
}

export function card(title, body) {
    return `
        <article class="module-card">
            <h2>${title}</h2>
            ${body}
        </article>
    `;
}

export function resultBox(id = 'moduleResult') {
    return `<div id="${id}" class="module-result hidden"></div>`;
}

export function showToast(type, message) {
    const container = document.getElementById('toastContainer');

    if (!container) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';

    toast.innerHTML = `
        <span>${icon}</span>
        <p>${message}</p>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

export function showModuleResult(title, data = {}, type = 'success', targetId = 'moduleResult') {
    const target = document.getElementById(targetId);

    if (!target) {
        showToast(type, title);
        return;
    }

    target.classList.remove('hidden');
    target.className = `module-result ${type}`;

    target.innerHTML = `
        <div class="result-title">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
            <h3>${title}</h3>
        </div>
        ${renderDetails(data)}
    `;
}

export function showSuccess(title, data = {}, targetId = 'moduleResult') {
    showToast('success', title);
    showModuleResult(title, data, 'success', targetId);
}

export function showError(error, targetId = 'moduleResult') {
    const message = error?.mensaje || error?.error || 'Ocurrió un error inesperado';

    showToast('error', message);
    showModuleResult(message, error, 'error', targetId);
}

export function setOutput(data) {
    const message = data?.mensaje || 'Operación realizada correctamente';
    showSuccess(message, data);
}

function renderDetails(data) {
    if (!data || typeof data !== 'object') {
        return `<p>${data || ''}</p>`;
    }

    const cleanData = flattenMainData(data);

    const keys = Object.keys(cleanData);

    if (keys.length === 0) {
        return '';
    }

    return `
        <div class="result-grid">
            ${keys.map(key => `
                <div class="result-item">
                    <span>${formatLabel(key)}</span>
                    <strong>${formatValue(cleanData[key])}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

function flattenMainData(data) {
    const result = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (typeof value !== 'object') {
            result[key] = value;
            return;
        }

        if (Array.isArray(value)) {
            result[key] = `${value.length} registro(s)`;
            return;
        }

        if (key === 'usuario' || key === 'trabajador' || key === 'transporte' || key === 'tarjeta' || key === 'viaje' || key === 'pago') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                if (typeof subValue !== 'object') {
                    result[subKey] = subValue;
                }
            });
        }
    });

    return result;
}

function formatLabel(label) {
    return label
        .replaceAll('_', ' ')
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return 'Sin dato';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        return new Date(value).toLocaleString();
    }

    return value;
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
                        ${keys.map(key => `<th>${formatLabel(key)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${keys.map(key => `<td>${formatValue(row[key])}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function summaryCard(title, data = {}) {
    return `
        <section class="module-card summary-card">
            <h2>${title}</h2>
            ${renderDetails(data)}
        </section>
    `;
}
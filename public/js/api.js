const API_BASE = '';

export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
    localStorage.removeItem('token');
}

export function setSessionUser(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function getSessionUser() {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
}

export function clearSession() {
    removeToken();
    localStorage.removeItem('usuario');
}

export async function apiRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || null;
    const auth = options.auth !== false;

    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();

    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
        method,
        headers
    };

    if (body !== null) {
        requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, requestOptions);

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            mensaje: 'La API no devolvió JSON válido'
        };
    }

    if (!response.ok) {
        throw data;
    }

    return data;
}

export function buildQuery(params) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value);
        }
    });

    return query.toString();
}
const API_URL = '';

export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
}

export function setUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function getUsuario() {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
}

export async function apiRequest(endpoint, method = 'GET', body = null, auth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();

    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
}
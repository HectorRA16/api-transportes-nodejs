import { apiRequest, setToken, setSessionUser, getSessionUser, clearSession } from './api.js';

export async function loginUsuario(email, password) {
    const data = await apiRequest('/api/auth/login-usuario', {
        method: 'POST',
        auth: false,
        body: {
            Email: email,
            Password: password
        }
    });

    guardarSesion(data);

    return data;
}

export async function loginTrabajador(cedula, password) {
    const data = await apiRequest('/api/auth/login-trabajador', {
        method: 'POST',
        auth: false,
        body: {
            Cedula: cedula,
            Password: password
        }
    });

    guardarSesion(data);

    return data;
}

function guardarSesion(data) {
    if (data.token) {
        setToken(data.token);
    }

    if (data.usuario) {
        setSessionUser(data.usuario);
    }
}

export function logout() {
    clearSession();
}

export function getCurrentUser() {
    return getSessionUser();
}

export function getRole() {
    const usuario = getCurrentUser();
    return usuario?.Rol || usuario?.rol || null;
}

export function isAuthenticated() {
    return Boolean(getCurrentUser());
}
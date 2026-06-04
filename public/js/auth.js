import { apiRequest, setToken, setUsuario, removeToken, getUsuario } from './api.js';

export async function login(email, password) {
    const data = await apiRequest('/api/auth/login-usuario', 'POST', {
        Email: email,
        Password: password
    }, false);

    if (data.token) {
        setToken(data.token);
        setUsuario(data.usuario);
    }

    return data;
}

export function logout() {
    removeToken();
}

export function usuarioActual() {
    return getUsuario();
}

export function obtenerRol() {
    const usuario = getUsuario();
    return usuario?.Rol || usuario?.rol || null;
}
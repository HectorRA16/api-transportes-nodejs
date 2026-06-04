import { loginUsuario, logout, getCurrentUser, getRole } from './auth.js';
import { renderLogin, renderShell, setOutput } from './components.js';
import { usuarioMenu, renderUsuarioView } from './views/usuario.js';
import { trabajadorMenu, renderTrabajadorView } from './views/trabajador.js';
import { adminMenu, renderAdminView } from './views/admin.js';

document.addEventListener('DOMContentLoaded', () => {
    const usuario = getCurrentUser();

    if (!usuario) {
        iniciarLogin();
        return;
    }

    iniciarDashboard();
});

function iniciarLogin() {
    renderLogin();

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const errorBox = document.getElementById('loginError');
        errorBox.classList.add('hidden');

        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const data = await loginUsuario(email, password);

            const rolRecibido = data.usuario?.Rol || data.usuario?.rol;

            if (!rolRecibido) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');

                errorBox.textContent = 'El usuario no tiene un rol asignado';
                errorBox.classList.remove('hidden');
                return;
            }

            if (!['usuario', 'trabajador', 'admin'].includes(rolRecibido)) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');

                errorBox.textContent = `Rol no válido: ${rolRecibido}`;
                errorBox.classList.remove('hidden');
                return;
            }

            location.reload();

        } catch (error) {
            errorBox.textContent = error.mensaje || error.error || 'Error al iniciar sesión';
            errorBox.classList.remove('hidden');
        }
    });
}

function iniciarDashboard() {
    const usuario = getCurrentUser();
    const rol = getRole();

    const menu = obtenerMenu(rol);

    renderShell(usuario, menu);

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
        location.reload();
    });

    document.querySelectorAll('.menu-item').forEach(button => {
        button.addEventListener('click', () => {
            cargarVista(button.dataset.view);
        });
    });

    if (menu.length > 0) {
        cargarVista(menu[0].id);
    } else {
        setOutput({
            mensaje: 'No hay menú disponible para este rol',
            rol
        });
    }
}

function obtenerMenu(rol) {
    if (rol === 'usuario') {
        return usuarioMenu;
    }

    if (rol === 'trabajador') {
        return trabajadorMenu;
    }

    if (rol === 'admin') {
        return adminMenu;
    }

    return [];
}

function cargarVista(view) {
    const rol = getRole();

    if (rol === 'usuario') {
        renderUsuarioView(view);
        return;
    }

    if (rol === 'trabajador') {
        renderTrabajadorView(view);
        return;
    }

    if (rol === 'admin') {
        renderAdminView(view);
    }
}
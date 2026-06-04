import { loginUsuario, loginTrabajador, logout, getCurrentUser, getRole } from './auth.js';
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

    const loginType = document.getElementById('loginType');
    const emailGroup = document.getElementById('emailGroup');
    const cedulaGroup = document.getElementById('cedulaGroup');

    loginType.addEventListener('change', () => {
        if (loginType.value === 'trabajador') {
            emailGroup.classList.add('hidden');
            cedulaGroup.classList.remove('hidden');
        } else {
            cedulaGroup.classList.add('hidden');
            emailGroup.classList.remove('hidden');
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const errorBox = document.getElementById('loginError');
        errorBox.classList.add('hidden');

        try {
            if (loginType.value === 'trabajador') {
                await loginTrabajador(
                    document.getElementById('cedula').value,
                    document.getElementById('password').value
                );
            } else {
                await loginUsuario(
                    document.getElementById('email').value,
                    document.getElementById('password').value
                );
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
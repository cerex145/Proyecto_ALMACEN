const normalizedRole = role => String(role || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const isAdmin = role => ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'].includes(normalizedRole(role));

function canAccess(user, method, route) {
    if (isAdmin(user.rol)) return true;
    const resource = route.split('/')[2];
    if (resource === 'alertas' && (/marcar/.test(route) || (method === 'DELETE' && route.endsWith('/:id')))) {
        return canAccess(user, 'GET', '/api/alertas/vencimiento');
    }
    if (resource === 'usuarios' && route === '/api/usuarios/me') return true;
    if (['usuarios', 'roles', 'auditorias'].includes(resource)) {
        return resource === 'usuarios' && route.endsWith('/cambiar-password') && Number(user.id) === Number(user.targetId);
    }
    if (route.includes('/testing/')) return false;
    const aliases = { lotes: 'productos', alertas: 'productos', ajustes: 'productos', actas: 'ingresos' };
    const module = aliases[resource] || resource;
    const read = ['GET', 'HEAD'].includes(method);
    const action = read ? (/exportar|plantilla/.test(route) ? 'export' : 'read')
        : method === 'DELETE' ? 'delete'
            : ['PUT', 'PATCH'].includes(method) || /aprobar|despachar|marcar|configurar/.test(route) ? 'update' : 'create';
    if (route.includes('configurar-dias')) return false;
    let permisos = user.permisos || {};
    if (typeof permisos === 'string') { try { permisos = JSON.parse(permisos); } catch { return false; } }
    const grants = permisos[resource] ?? permisos[module];
    if (grants !== undefined) {
        return grants === true || grants?.[action] === true || (action === 'export' && grants?.read === true && grants?.export !== false);
    }
    if (Object.keys(permisos).length) return false;
    const role = normalizedRole(user.rol);
    if (['CONSULTA', 'CONSULTOR', 'LECTOR', 'VISOR'].includes(role)) return read;
    if (role === 'SUPERVISOR') return true;
    if (['ALMACENERO', 'OPERADOR'].includes(role)) return action !== 'delete';
    return false;
}

module.exports = { normalizedRole, isAdmin, canAccess };

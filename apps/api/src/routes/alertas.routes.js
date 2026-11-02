const { getAlerts, getDays, setDays, saveState } = require('../services/alertas.service');

module.exports = async function alertasRoutes(fastify) {
    const load = request => getAlerts(fastify.db, request.user.id);
    fastify.get('/api/alertas/vencimiento', {
        schema: { tags: ['Alertas'], querystring: { type: 'object', properties: {
            estado: { type: 'string', enum: ['VIGENTE', 'NORMAL', 'PROXIMO_A_VENCER', 'VENCIDO'] },
            leida: { type: 'boolean' }, page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 }
        } } }
    }, async request => {
        const all = await load(request);
        const { estado, leida, page = 1, limit = 50 } = request.query;
        const filtered = all.filter(alerta => (!estado || alerta.estado === (estado === 'NORMAL' ? 'VIGENTE' : estado))
            && (leida === undefined || alerta.leida === leida));
        return { success: true, data: filtered.slice((page - 1) * limit, page * limit),
            resumen: { vencidos: all.filter(a => a.estado === 'VENCIDO').length,
                proximos_a_vencer: all.filter(a => a.estado === 'PROXIMO_A_VENCER').length, total_alertas: filtered.length },
            pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) } };
    });
    fastify.get('/api/alertas/resumen', async request => {
        const all = await load(request);
        const vencidos = all.filter(a => a.estado === 'VENCIDO');
        const proximos = all.filter(a => a.estado === 'PROXIMO_A_VENCER');
        return { success: true, resumen: {
            total_vencidos: vencidos.length, total_proximos_a_vencer: proximos.length,
            total_vigentes: all.filter(a => a.estado === 'VIGENTE').length,
            proximos_a_vencer_detalle: proximos.slice(0, 5), vencidos_detalle: vencidos.slice(0, 5),
            requiere_atencion: vencidos.length + proximos.length > 0, dias_anticipacion: await getDays(fastify.db)
        } };
    });
    fastify.put('/api/alertas/:id/marcar-leida', async (request, reply) => {
        const alerta = (await load(request)).find(a => a.id === Number(request.params.id));
        if (!alerta) return reply.code(404).send({ success: false, error: 'Alerta no encontrada' });
        await saveState(fastify.db, request, [alerta], 'LEER_ALERTA');
        return { success: true, message: 'Alerta marcada como leída' };
    });
    fastify.post('/api/alertas/marcar-todos-leidos', async request => {
        await saveState(fastify.db, request, (await load(request)).filter(a => !a.leida), 'LEER_ALERTA');
        return { success: true, message: 'Alertas marcadas como leídas' };
    });
    fastify.delete('/api/alertas/:id', async (request, reply) => {
        const alerta = (await load(request)).find(a => a.id === Number(request.params.id));
        if (!alerta) return reply.code(404).send({ success: false, error: 'Alerta no encontrada' });
        await saveState(fastify.db, request, [alerta], 'DESCARTAR_ALERTA');
        return { success: true, message: 'Alerta descartada; volverá a aparecer si cambia su estado o cantidad' };
    });
    fastify.post('/api/alertas/configurar-dias', {
        schema: { body: { type: 'object', required: ['dias'], properties: {
            dias: { type: 'integer', minimum: 1, maximum: 3650 }
        } } }
    }, async request => {
        await setDays(fastify.db, request, request.body.dias);
        return { success: true, message: 'Anticipación de alertas actualizada', dias: request.body.dias };
    });
    fastify.get('/api/lotes/proximos-a-vencer', async request => {
        const data = (await getAlerts(fastify.db, null)).filter(a => a.estado === 'PROXIMO_A_VENCER').map(a => a.lote);
        return { success: true, data, mensaje: `${data.length} lotes próximos a vencer` };
    });
    fastify.get('/api/lotes/vencidos', async request => {
        const data = (await getAlerts(fastify.db, null)).filter(a => a.estado === 'VENCIDO').map(a => a.lote);
        return { success: true, data, mensaje: `${data.length} lotes vencidos` };
    });
};

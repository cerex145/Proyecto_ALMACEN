const axios = require('axios');

const API_URL = (process.env.API_URL || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');

const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 5000
});

async function testEndpoints() {
    console.log('🧪 Testeando endpoints\n');
    
    // Test kardex
    console.log('📊 Testeando /api/kardex...');
    try {
        const res = await api.get('/kardex?limit=5');
        console.log(`  ✅ Status: ${res.status}`);
        console.log(`  Registros: ${res.data.length || 0}`);
    } catch (e) {
        console.log(`  ❌ Error: ${e.response?.status || 'sin respuesta'}`);
        console.log(`  Mensaje: ${e.response?.data?.message || e.message}`);
    }
    
    // Test alertas VENCIDO
    console.log('\n⚠️  Testeando /api/alertas/vencimiento (VENCIDO)...');
    try {
        const res = await api.get('/alertas/vencimiento?estado=VENCIDO&limit=5');
        console.log(`  ✅ Status: ${res.status}`);
        console.log(`  Registros: ${res.data.length || 0}`);
    } catch (e) {
        console.log(`  ❌ Error: ${e.response?.status || 'sin respuesta'}`);
        console.log(`  Mensaje: ${e.response?.data?.message || e.message}`);
    }
    
    // Test alertas PROXIMO_A_VENCER
    console.log('\n⚠️  Testeando /api/alertas/vencimiento (PROXIMO_A_VENCER)...');
    try {
        const res = await api.get('/alertas/vencimiento?estado=PROXIMO_A_VENCER&limit=5');
        console.log(`  ✅ Status: ${res.status}`);
        console.log(`  Registros: ${res.data.length || 0}`);
    } catch (e) {
        console.log(`  ❌ Error: ${e.response?.status || 'sin respuesta'}`);
        console.log(`  Mensaje: ${e.response?.data?.message || e.message}`);
    }
    
    // Test health check
    console.log('\n💚 Testeando /health...');
    try {
        const res = await api.get('/health', { baseURL: API_URL });
        console.log(`  ✅ Status: ${res.status}`);
    } catch (e) {
        console.log(`  ⚠️  No existe endpoint /health`);
    }
}

testEndpoints();

const http = require('http');

function check(url, name) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ ${name}: OK (${res.statusCode})`);
                    resolve(true);
                } else {
                    console.log(`❌ ${name}: FAILED (${res.statusCode}) - ${data.substring(0, 100)}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${name}: ERROR - ${err.message}`);
            resolve(false);
        });
    });
}

async function runChecks() {
    console.log('🔍 Starting System Health Check...\n');
    
    // 1. Check Backend Server
    const serverUp = await check('http://localhost:3000/health', 'Backend Server (Health)');
    
    if (serverUp) {
        // 2. Check Database via API
        await check('http://localhost:3000/api/clientes', 'API: Clientes Endpoint');
        await check('http://localhost:3000/api/ajustes', 'API: Ajustes Endpoint');
        await check('http://localhost:3000/api/productos', 'API: Productos Endpoint');
    }

    // 3. Check Frontend Dev Server
    await check('http://localhost:5173', 'Frontend Dev Server (Vite)');

    console.log('\n🏁 Health Check Complete.');
}

runChecks();

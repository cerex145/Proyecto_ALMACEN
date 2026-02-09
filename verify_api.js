const axios = require('axios');

async function checkApi() {
    try {
        console.log('Checking /api/clientes...');
        const clientes = await axios.get('http://localhost:3000/api/clientes');
        console.log('Clientes Status:', clientes.status);
        console.log('Clientes Data Keys:', Object.keys(clientes.data));
        if (clientes.data.data && Array.isArray(clientes.data.data)) {
            console.log('Clientes Count:', clientes.data.data.length);
        } else {
            console.log('Clientes Data Structure Unexpected:', clientes.data);
        }

        console.log('\nChecking /api/productos...');
        const productos = await axios.get('http://localhost:3000/api/productos');
        console.log('Productos Status:', productos.status);
        console.log('Productos Data Keys:', Object.keys(productos.data));
        if (productos.data.data && Array.isArray(productos.data.data)) {
            console.log('Productos Count:', productos.data.data.length);
        } else {
            console.log('Productos Data Structure Unexpected:', productos.data);
        }

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

checkApi();

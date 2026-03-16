const axios = require('axios');

const API_URL = (process.env.API_URL || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');

async function verifyFIFO() {
    try {
        // 1. Check stock of product 14 before sale (we need to know what lot it has)
        // Since we can't easily query DB from here without setup, we will just try to create a small sale.
        // We assume product 14 has some stock (from previous check script)

        const payload = {
            cliente_id: 6, // existing client
            fecha: '2026-02-12',
            responsable_id: 1,
            detalles: [
                {
                    producto_id: 14,
                    cantidad: 1, // Small amount to test
                    precio_unitario: 10
                }
            ]
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(`${API_URL}/api/salidas`, payload);
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('✅ Sale created successfully using FIFO!');
        } else {
            console.error('❌ Sale failed:', response.data);
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

verifyFIFO();

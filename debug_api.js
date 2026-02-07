async function testApi() {
    try {
        console.log('Testing GET /api/ajustes...');
        const response = await fetch('http://localhost:3000/api/ajustes');
        const data = await response.json(); // Assuming JSON response
        console.log('Status:', response.status);
        if (!response.ok) {
             console.error('Error Data:', JSON.stringify(data, null, 2));
        } else {
             console.log('Data:', data);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testApi();

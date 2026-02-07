async function testApi() {
    try {
        console.log('Testing GET /api/clientes...');
        const response = await fetch('http://localhost:3000/api/clientes');
        const text = await response.text();
        console.log('Status:', response.status);
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Text:', text);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testApi();

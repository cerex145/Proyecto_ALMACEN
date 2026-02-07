async function testDashboardApi() {
    const endpoints = [
        'http://localhost:3000/api/alertas/vencimiento?limit=5',
        'http://localhost:3000/api/kardex?limit=5'
    ];

    for (const url of endpoints) {
        try {
            console.log(`\nTesting ${url}...`);
            const response = await fetch(url);
            const text = await response.text();
            console.log('Status:', response.status);
            try {
                const json = JSON.parse(text);
                if (!response.ok) {
                    console.error('❌ Error JSON:', JSON.stringify(json, null, 2));
                } else {
                    console.log('✅ Success');
                }
            } catch (e) {
                console.log('Response Text:', text);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }
}

testDashboardApi();

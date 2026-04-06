const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});
async function check() {
    await client.connect();
    const res = await client.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'id'");
    console.log(res.rows);
    await client.end();
}
check();

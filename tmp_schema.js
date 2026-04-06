const { Client } = require('pg');
const c = new Client('postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
c.connect().then(()=>c.query("SELECT column_name FROM information_schema.columns WHERE table_name='actas_recepcion'")).then(res=>{console.log(res.rows.map(r=>r.column_name)); c.end()});

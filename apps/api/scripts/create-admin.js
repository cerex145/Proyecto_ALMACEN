const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    await client.connect();
    
    // Create Roles if they don't exist
    const roleCheck = await client.query("SELECT id FROM roles WHERE nombre = 'ADMIN'");
    let roleId;
    if (roleCheck.rows.length === 0) {
        const roleRes = await client.query("INSERT INTO roles (nombre, descripcion, permisos) VALUES ('ADMIN', 'Administrador del sistema', '{}') RETURNING id");
        roleId = roleRes.rows[0].id;
    } else {
        roleId = roleCheck.rows[0].id;
    }

    // Insert user
    const passwordHash = await bcrypt.hash('123456', 10);
    const insertQuery = `
      INSERT INTO usuarios (nombre, usuario, email, password, rol_id, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const res = await client.query(insertQuery, ['Administrador General', 'admin', 'admin@sistema.com', passwordHash, roleId, 1]);
    console.log("Admin creado exitosamente:");
    console.table([{ usuario: res.rows[0].usuario, email: res.rows[0].email, rol_id: res.rows[0].rol_id }]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createAdmin();

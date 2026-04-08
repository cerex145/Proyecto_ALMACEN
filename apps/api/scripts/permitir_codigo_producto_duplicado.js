const AppDataSource = require('../src/config/database');

async function main() {
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  try {
    await qr.connect();

    const constraints = await qr.query(
      `
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
       AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'productos'
        AND tc.constraint_type = 'UNIQUE'
        AND ccu.column_name = 'codigo'
      `
    );

    if (!constraints.length) {
      console.log('No se encontraron restricciones UNIQUE en productos.codigo');
      return;
    }

    for (const row of constraints) {
      const name = row.constraint_name;
      await qr.query(`ALTER TABLE public.productos DROP CONSTRAINT IF EXISTS "${name}"`);
      console.log(`Constraint eliminada: ${name}`);
    }

    console.log('Listo: productos.codigo ahora permite duplicados.');
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Error al eliminar restricción UNIQUE de productos.codigo:', err.message);
  process.exit(1);
});

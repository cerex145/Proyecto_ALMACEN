const fs = require('fs');

function debug() {
    const csvPath = 'C:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\DATAA\\DB_almacen.csv';
    const content = fs.readFileSync(csvPath, 'binary');
    const lines = content.split(/\r?\n/);
    console.log(`Total Rows: ${lines.length}`);

    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Try various things that MUST be there if valid rows exist
        if (line.includes('PINZA') || line.includes('Foerster')) {
            console.log(`\n--- FOUND HIT #${count + 1} at Row ${i} ---`);
            const vals = line.split(';');
            vals.forEach((v, k) => console.log(`[${k}]: ${v}`));
            count++;
            if (count > 2) break;
        }
    }

    if (count === 0) console.log('\n❌ PINZA not found!');
}

debug();

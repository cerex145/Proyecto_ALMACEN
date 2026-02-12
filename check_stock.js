var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('/home/bugsara/CEREX/Proyecto_ALMACEN/data/almacen.sqlite');

db.serialize(function () {
    db.get("SELECT * FROM productos WHERE id = 14", function (err, row) {
        if (err) {
            console.error(err);
        } else {
            console.log('Producto 14:', row);
        }
    });

    db.all("SELECT * FROM lotes WHERE producto_id = 14", function (err, rows) {
        if (err) console.error(err);
        else console.log('Lotes Producto 14:', rows);
    });
});

db.close();

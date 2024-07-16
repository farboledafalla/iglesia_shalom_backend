// Router de express
const rutas = require('express').Router();

// Conexión a la bd
const conexion = require('./config/conexion');

// Rutas para los miembros
// Todos los miembros
rutas.get('/miembros', function (req, res) {
   let sql = 'select * from miembros';
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Un solo miembro
rutas.get('/miembros/:id', (req, res) => {
   const { id } = req.params;
   let sql = 'select * from miembros where id_miembro = ?';
   conexion.query(sql, [id], (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Agregar miembro
rutas.post('/miembros', (req, res) => {
   const { cedula, nombres, apellidos, celular } = req.body;
   let sql = `insert into miembros(cedula,nombres,apellidos,celular) values(${cedula},'${nombres}','${apellidos}',${celular})`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Miembro agregado' });
   });
});

// Editar un miembro
rutas.put('/miembros/:id', (req, res) => {
   const { id } = req.params;
   const { cedula, nombres, apellidos, celular } = req.body;
   let sql = `update miembros set cedula = ${cedula}, nombres = '${nombres}', apellidos = '${apellidos}', celular = ${celular} where id_miembro = ${id}`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Miembro editado' });
   });
});

// Eliminar miembro
rutas.delete('/miembros/:id', (req, res) => {
   const { id } = req.params;
   let sql = `delete from miembros where id_miembro = ${id}`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Miembro eliminado' });
   });
});

// Exportar la ruta
module.exports = rutas;

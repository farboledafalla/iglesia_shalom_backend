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

// Rutas para los ministerios
// Todos los ministerios
rutas.get('/ministerios', function (req, res) {
   let sql = 'select * from ministerios';
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Un solo ministerio
rutas.get('/ministerios/:id', (req, res) => {
   const { id } = req.params;
   let sql = 'select * from ministerios where id_ministerio = ?';
   conexion.query(sql, [id], (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Agregar ministerio
rutas.post('/ministerios', (req, res) => {
   const { nombre, descripcion } = req.body;
   let sql = `insert into ministerios(nombre,descripcion) values('${nombre}','${descripcion}')`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Ministerio agregado' });
   });
});

// Editar un ministerio
rutas.put('/ministerios/:id', (req, res) => {
   const { id } = req.params;
   const { nombre, descripcion } = req.body;
   let sql = `update ministerios set nombre = '${nombre}', descripcion = '${descripcion}' where id_ministerio = ${id}`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Ministerio editado' });
   });
});

// Eliminar ministerio
rutas.delete('/ministerios/:id', (req, res) => {
   const { id } = req.params;
   let sql = `delete from ministerios where id_ministerio = ${id}`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Ministerio eliminado' });
   });
});

// Rutas para los miembros_ministerios
// Todos los miembros_ministerios
rutas.get('/miem_mini', function (req, res) {
   let sql =
      'select mm.id_miembro,m.nombres,m.apellidos,mm.id_ministerio,mi.nombre from Miembro_Ministerio mm join Miembros m on mm.id_miembro = m.id_miembro join Ministerios mi on mm.id_ministerio = mi.id_ministerio';
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Exportar la ruta
module.exports = rutas;

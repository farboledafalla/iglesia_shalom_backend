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
   let sql = `INSERT INTO miembros(cedula,nombres,apellidos,celular) VALUES(?,?,?,?)`;
   conexion.query(sql, [cedula, nombres, apellidos, celular], (err, result) => {
      if (err) {
         if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Cédula duplicada' });
         }

         return res.status(500).json({ error: 'Error al insertar el miembro' });
      }

      res.json({ status: 'Miembro agregado', id_miembro: result.insertId });
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

   // Verificar si el miembro está relacionado con ministerios
   const sqlCheckRelations =
      'SELECT COUNT(*) as count FROM Miembro_Ministerio WHERE id_miembro = ?';
   conexion.query(sqlCheckRelations, [id], (err, result) => {
      if (err) {
         console.error(err);
         return res
            .status(500)
            .json({ status: 'Error al verificar relaciones del miembro' });
      }

      if (result[0].count > 0) {
         return res.status(400).json({
            status:
               'No se puede eliminar el miembro porque está relacionado con uno o más ministerios',
         });
      }

      // Eliminar miembro si no hay relaciones
      const sql = `DELETE FROM miembros WHERE id_miembro = ?`;
      conexion.query(sql, [id], (err, result) => {
         if (err) {
            console.error(err);
            return res
               .status(500)
               .json({ status: 'Error al eliminar miembro' });
         }

         res.json({ status: 'Miembro eliminado' });
      });
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

   // Verificar si el ministerio está relacionado con algún miembro
   const sqlCheckRelationsMinisterio =
      'SELECT COUNT(*) as count FROM Miembro_Ministerio WHERE id_ministerio = ?';
   conexion.query(sqlCheckRelationsMinisterio, [id], (err, result) => {
      if (err) {
         console.error(err);
         return res
            .status(500)
            .json({ status: 'Error al verificar relaciones del ministerio' });
      }

      if (result[0].count > 0) {
         return res.status(400).json({
            status:
               'No se puede eliminar el ministerios porque está relacionado con uno o más miembros',
         });
      }

      // Eliminar el ministerio
      const sql = `DELETE FROM ministerios WHERE id_ministerio = ${id}`;
      conexion.query(sql, [id], (err, result) => {
         if (err) {
            console.error(err);
            return res
               .status(500)
               .json({ status: 'Error al eliminar el ministerio' });
         }

         res.json({ status: 'Ministerio eliminado' });
      });
   });
});

// Rutas para los miembros_ministerios
// Todos los miembros_ministerios
rutas.get('/miem-mini', function (req, res) {
   let sql =
      'select mm.id_miembro,concat(m.nombres," ",m.apellidos) as nombre_completo,mm.id_ministerio,mi.nombre,mm.fecha_ingreso,mm.fecha_retiro,mm.estado,mm.estado_eliminado from Miembro_Ministerio mm join Miembros m on mm.id_miembro = m.id_miembro join Ministerios mi on mm.id_ministerio = mi.id_ministerio where mm.estado_eliminado = "A"';
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json(rows);
   });
});

// Agregar Miembro Ministerio
rutas.post('/miem-mini', (req, res) => {
   const { id_miembro, id_ministerio } = req.body;

   // Verificar si ese miembro ya esá registrado en ese ministerio
   const sqlExisteMiembroMinisterio =
      'SELECT COUNT(*) as count FROM Miembro_Ministerio WHERE id_miembro = ? AND id_ministerio = ?';
   conexion.query(
      sqlExisteMiembroMinisterio,
      [id_miembro, id_ministerio],
      (err, result) => {
         if (err) {
            console.error(err);
            return res.status(500).json({
               status:
                  'Error al verificar existencia de relación Miembro-Ministerio',
            });
         }

         if (result[0].count > 0) {
            return res.status(400).json({
               status: 'Ya existe registrado el miembro en ese ministerio',
            });
         }

         // Insertar registro
         const sql = `insert into miembro_ministerio(id_miembro,id_ministerio,fecha_ingreso) values(?,?,DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'))`;
         conexion.query(sql, [id_miembro, id_ministerio], (err, result) => {
            if (err) {
               console.error(err);
               return res
                  .status(500)
                  .json({ status: 'Error al insertar el registro' });
            }

            res.json({ status: 'Registro agregado' });
         });
      }
   );
});

// Editar un Miembro Ministerio
rutas.put('/miem-mini/:id_miembro/:id_ministerio', (req, res) => {
   const { id_miembro, id_ministerio } = req.params;
   const { fechaIngreso } = req.body;
   let sql = `update miembro_ministerio set fecha_ingreso = '${fechaIngreso}' where id_miembro = ${id_miembro} and id_ministerio = ${id_ministerio}`;
   conexion.query(sql, (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Registro editado' });
   });
});

// Retirar un Miembro de un Ministerio
rutas.put('/miem-mini/retirar/:id_miembro/:id_ministerio', (req, res) => {
   const { id_miembro, id_ministerio } = req.params;
   let sql = `update miembro_ministerio set fecha_retiro = DATE_FORMAT(
      NOW(),
      '%Y-%m-%d %H:%i:%s'
   ), estado = 'C' where id_miembro = ? and id_ministerio = ?`;
   conexion.query(sql, [id_miembro, id_ministerio], (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Miembro retirado del ministerio' });
   });
});

// Eliminar registro Miembro - Ministerio
rutas.put('/miem-mini/eliminar/:id_miembro/:id_ministerio', (req, res) => {
   const { id_miembro, id_ministerio } = req.params;
   let sql = `update miembro_ministerio set estado_eliminado = 'C' where id_miembro = ? and id_ministerio = ?`;
   conexion.query(sql, [id_miembro, id_ministerio], (err, rows, fields) => {
      if (err) throw err;
      else res.json({ status: 'Miembro retirado del ministerio' });
   });
});

// Ruta para el drag and drop
rutas.post('/relacionar', (req, res) => {
   const { id_miembro, id_ministerio } = req.body;

   const sql =
      'INSERT INTO Miembro_Ministerio (id_miembro, id_ministerio, fecha_ingreso) VALUES (?, ?, DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s"))';
   conexion.query(sql, [id_miembro, id_ministerio], (err, result) => {
      if (err) {
         console.error('Error relacionando miembro y ministerio:', err);
         return res.status(500).send('Error relacionando miembro y ministerio');
      }
      res.status(200).send('Miembro y ministerio relacionado');
   });
});

// Exportar la ruta
module.exports = rutas;

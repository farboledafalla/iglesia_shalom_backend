// Router de express
const rutas = require('express').Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            return res
               .status(400)
               .json({ error: `Cédula (${cedula}) duplicada` });
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
   let sql = `INSERT INTO ministerios(nombre,descripcion) VALUES(?,?)`;
   conexion.query(sql, [nombre, descripcion], (err, result) => {
      if (err) {
         if (err.code === 'ER_DUP_ENTRY') {
            return res
               .status(400)
               .json({ error: `Nombre (${nombre}) duplicado` });
         }

         return res
            .status(500)
            .json({ error: 'Error al insertar el ministerio' });
      }

      res.json({
         status: 'Ministerio agregado',
         id_ministerio: result.insertId,
      });
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

// Autenticación
const secretKey = 'your_secret_key';

// Registro
rutas.post('/register', (req, res) => {
   const { username, password } = req.body;
   const hashedPassword = bcrypt.hashSync(password, 8);

   const sql = 'INSERT INTO Usuarios (username, password) VALUES (?, ?)';
   conexion.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
         return res
            .status(500)
            .json({ error: 'Error al registrar el usuario' });
      }
      res.json({ status: 'Usuario registrado' });
   });
});

// Inicio de sesión
rutas.post('/login', (req, res) => {
   const { username, password } = req.body;

   const sql = 'SELECT * FROM Usuarios WHERE username = ?';
   conexion.query(sql, [username], (err, results) => {
      if (err) {
         return res.status(500).json({ error: 'Error al buscar el usuario' });
      }
      if (results.length === 0) {
         return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = results[0];
      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
         return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Creación del token usando datos del usuario
      const token = jwt.sign(
         { id: user.id, username: user.username },
         secretKey,
         {
            expiresIn: 3600, // 2 horas, (86400) 24 horas
         }
      );

      res.json({ auth: true, token });
   });
});

// Middleware para verificar el token
function verifyToken(req, res, next) {
   const token = req.headers['x-access-token'];
   if (!token) {
      return res.status(403).json({ auth: false, message: 'No existe token' });
   }

   jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
         return res
            .status(500)
            .json({ auth: false, message: 'Falló autenticación del token' });
      }
      // Pasar los datos del usuario
      req.userId = decoded.id;
      req.username = decoded.username;
      next();
   });
}

// Ruta protegida de ejemplo
rutas.get('/me', verifyToken, (req, res) => {
   res.json({ id: req.userId, username: req.username });
});

// Paginación directa en la ruta
// rutas.get('/pag_miembros2', (req, res) => {
//    const page = parseInt(req.query.page) || 1;
//    const limit = parseInt(req.query.limit) || 5;
//    const offset = (page - 1) * limit;

//    // Consulta para obtener los miembros con paginación
//    conexion.query(
//       'SELECT * FROM miembros LIMIT ? OFFSET ?',
//       [limit, offset],
//       (error, miembros) => {
//          if (error) {
//             return res
//                .status(500)
//                .json({ error: 'Error al obtener los miembros' });
//          }

//          // Consulta para obtener el total de miembros
//          conexion.query(
//             'SELECT COUNT(*) AS total FROM miembros',
//             (error, results) => {
//                if (error) {
//                   return res
//                      .status(500)
//                      .json({ error: 'Error al contar los miembros' });
//                }

//                const totalCount = results[0].total;
//                const totalPages = Math.ceil(totalCount / limit);

//                res.json({
//                   miembros,
//                   totalPages,
//                   currentPage: page,
//                });
//             }
//          );
//       }
//    );
// });

// middleware/pagination.js
const paginatedResults = (conexion, table) => {
   return (req, res, next) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};

      // Obtener el total de registros
      conexion.query(
         `SELECT COUNT(*) AS count FROM ??`,
         [table],
         (err, countResult) => {
            if (err) {
               return res.status(500).json({ message: err.message });
            }

            const totalRecords = countResult[0].count;
            const totalPages = Math.ceil(totalRecords / limit);

            if (endIndex < totalRecords) {
               results.next = {
                  page: page + 1,
                  limit: limit,
               };
            }

            if (startIndex > 0) {
               results.previous = {
                  page: page - 1,
                  limit: limit,
               };
            }

            // Obtener los registros para la página actual
            conexion.query(
               `SELECT * FROM ?? LIMIT ? OFFSET ?`,
               [table, limit, startIndex],
               (err, rows) => {
                  if (err) {
                     return res.status(500).json({ message: err.message });
                  }

                  results.results = rows;
                  results.totalRecords = totalRecords;
                  results.totalPages = totalPages;
                  results.currentPage = page;
                  res.paginatedResults = results;
                  next();
               }
            );
         }
      );
   };
};

// Miembros paginados
rutas.get(
   '/pag_miembros',
   paginatedResults(conexion, 'miembros'),
   (req, res) => {
      res.json(res.paginatedResults);
   }
);

// Ministerios paginados
rutas.get(
   '/pag_ministerios',
   paginatedResults(conexion, 'ministerios'),
   (req, res) => {
      res.json(res.paginatedResults);
   }
);

// Paginación directa en la ruta
rutas.get('/pag_miembros_ministerios', (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 5;
   const offset = (page - 1) * limit;

   // Consulta para obtener los miembros con paginación
   conexion.query(
      'select mm.id_miembro,concat(m.nombres," ",m.apellidos) as nombre_completo,mm.id_ministerio,mi.nombre,mm.fecha_ingreso,mm.fecha_retiro,mm.estado,mm.estado_eliminado from Miembro_Ministerio mm join Miembros m on mm.id_miembro = m.id_miembro join Ministerios mi on mm.id_ministerio = mi.id_ministerio where mm.estado_eliminado = "A" LIMIT ? OFFSET ?',
      [limit, offset],
      (error, rows) => {
         if (error) {
            return res
               .status(500)
               .json({ error: 'Error al obtener los registros' });
         }

         // Consulta para obtener el total de miembros
         conexion.query(
            'SELECT COUNT(*) AS total FROM Miembro_Ministerio WHERE estado_eliminado = "A"',
            (error, results) => {
               if (error) {
                  return res
                     .status(500)
                     .json({ error: 'Error al contar los registros' });
               }

               const totalCount = results[0].total;
               const totalPages = Math.ceil(totalCount / limit);

               res.json({
                  rows,
                  totalPages,
                  currentPage: page,
               });
            }
         );
      }
   );
});

// Exportar la ruta
module.exports = rutas;

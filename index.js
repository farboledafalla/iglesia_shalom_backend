// Conexión a la bd
require('./config/conexion');

// Módulos
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Definir puerto
const port = process.env.port || 3000;

// Instancia de express
const app = express();

// Permitir trabajar con JSON
app.use(express.json());

// Configurar el puerto
app.set('port', port);

// CORS
app.use(cors());

// Las rutas iniciarán a partir de '/api'
app.use('/api', require('./rutas'));

// Iniciar express
app.listen(app.get('port'), (error) => {
   if (error) {
      console.log('Error al iniciar el servidor: ' + error);
   } else {
      console.log('Servidor iniciado en el puerto: ' + port);
   }
});

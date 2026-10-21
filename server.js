require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const miembrosRoutes = require('./routes/miembros');
const proyectosRoutes = require('./routes/proyectos');
const tareasRoutes = require('./routes/tareas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/miembros', miembrosRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/tareas', tareasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

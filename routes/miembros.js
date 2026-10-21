const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/miembros — Obtener todos los miembros
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM miembros ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
});

// GET /api/miembros/:id — Obtener un miembro por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM miembros WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el miembro' });
  }
});

// POST /api/miembros — Crear un miembro
router.post('/', async (req, res) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO miembros (nombre, email, rol) VALUES (?, ?, ?)',
      [nombre, email, rol || 'Desarrollador']
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol: rol || 'Desarrollador' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear el miembro' });
  }
});

// PUT /api/miembros/:id — Actualizar un miembro
router.put('/:id', async (req, res) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE miembros SET nombre = ?, email = ?, rol = ? WHERE id = ?',
      [nombre, email, rol || 'Desarrollador', req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }
    res.json({ id: parseInt(req.params.id), nombre, email, rol });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al actualizar el miembro' });
  }
});

// DELETE /api/miembros/:id — Eliminar un miembro
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM miembros WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }
    res.json({ mensaje: 'Miembro eliminado correctamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'No se puede eliminar: el miembro tiene proyectos o tareas asignadas' });
    }
    res.status(500).json({ error: 'Error al eliminar el miembro' });
  }
});

module.exports = router;

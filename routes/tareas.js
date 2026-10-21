const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/tareas — Obtener todas las tareas (con filtro opcional por proyecto)
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT t.*, p.nombre AS proyecto_nombre, m.nombre AS asignado
      FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN miembros m ON t.miembro_id = m.id
    `;
    const params = [];

    if (req.query.proyecto_id) {
      query += ' WHERE t.proyecto_id = ?';
      params.push(req.query.proyecto_id);
    }

    query += ' ORDER BY t.prioridad DESC, t.fecha_limite ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// GET /api/tareas/:id — Obtener una tarea por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, p.nombre AS proyecto_nombre, m.nombre AS asignado
      FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN miembros m ON t.miembro_id = m.id
      WHERE t.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

// POST /api/tareas — Crear una tarea
router.post('/', async (req, res) => {
  const { titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id } = req.body;

  if (!titulo || !proyecto_id) {
    return res.status(400).json({ error: 'Título y proyecto son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tareas (titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion || null, estado || 'Pendiente', prioridad || 'Media', fecha_limite || null, proyecto_id, miembro_id || null]
    );
    res.status(201).json({ id: result.insertId, titulo, descripcion, estado: estado || 'Pendiente', prioridad: prioridad || 'Media', fecha_limite, proyecto_id, miembro_id });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El proyecto o miembro seleccionado no existe' });
    }
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT /api/tareas/:id — Actualizar una tarea
router.put('/:id', async (req, res) => {
  const { titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id } = req.body;

  if (!titulo || !proyecto_id) {
    return res.status(400).json({ error: 'Título y proyecto son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ?, fecha_limite = ?, proyecto_id = ?, miembro_id = ? WHERE id = ?',
      [titulo, descripcion || null, estado || 'Pendiente', prioridad || 'Media', fecha_limite || null, proyecto_id, miembro_id || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ id: parseInt(req.params.id), titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE /api/tareas/:id — Eliminar una tarea
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;

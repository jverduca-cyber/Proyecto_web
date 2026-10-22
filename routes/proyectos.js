const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/proyectos — Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, m.nombre AS responsable
      FROM proyectos p
      JOIN miembros m ON p.miembro_id = m.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// GET /api/proyectos/:id — Obtener un proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, m.nombre AS responsable
      FROM proyectos p
      JOIN miembros m ON p.miembro_id = m.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
});

// POST /api/proyectos — Crear un proyecto
router.post('/', async (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id } = req.body;

  if (!nombre || !fecha_inicio || !miembro_id) {
    return res.status(400).json({ error: 'Nombre, fecha de inicio y responsable son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion || null, fecha_inicio, fecha_fin || null, estado || 'Planificación', miembro_id]
    );
    res.status(201).json({ id: result.insertId, nombre, descripcion, fecha_inicio, fecha_fin, estado: estado || 'Planificación', miembro_id });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El responsable seleccionado no existe' });
    }
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
});

// PUT /api/proyectos/:id — Actualizar un proyecto
router.put('/:id', async (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id } = req.body;

  if (!nombre || !fecha_inicio || !miembro_id) {
    return res.status(400).json({ error: 'Nombre, fecha de inicio y responsable son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE proyectos SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, miembro_id = ? WHERE id = ?',
      [nombre, descripcion || null, fecha_inicio, fecha_fin || null, estado || 'Planificación', miembro_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json({ id: parseInt(req.params.id), nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// GET /api/proyectos/:id/miembros — Obtener miembros asociados a un proyecto
router.get('/:id/miembros', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT m.id, m.nombre, m.email, m.rol,
        CASE WHEN p.miembro_id = m.id THEN 'Responsable' ELSE 'Colaborador' END AS participacion
      FROM miembros m
      LEFT JOIN proyectos p ON p.miembro_id = m.id AND p.id = ?
      LEFT JOIN tareas t ON t.miembro_id = m.id AND t.proyecto_id = ?
      WHERE p.id IS NOT NULL OR t.id IS NOT NULL
      ORDER BY participacion ASC, m.nombre ASC
    `, [req.params.id, req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener miembros del proyecto' });
  }
});

// DELETE /api/proyectos/:id — Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM proyectos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

module.exports = router;

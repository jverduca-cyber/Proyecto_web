// ================================================
// Gestor de Proyectos — Frontend
// ================================================

const API = '/api';

// ===== Utilidades =====

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error en la solicitud');
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor');
    }
    throw error;
  }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
  const el = document.getElementById('notificacion');
  el.textContent = mensaje;
  el.className = `notificacion ${tipo}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function badgeEstado(estado) {
  const clase = estado.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u')
    .replace(/\s+/g, '-');
  return `<span class="badge badge-${clase}">${estado}</span>`;
}

function badgePrioridad(prioridad) {
  const clase = prioridad.toLowerCase();
  return `<span class="badge badge-${clase}">${prioridad}</span>`;
}

// ===== Navegación =====

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });

    btn.classList.add('active');
    const seccion = document.getElementById(`sec-${btn.dataset.section}`);
    seccion.classList.remove('hidden');
    seccion.classList.add('active');

    if (btn.dataset.section === 'proyectos') cargarProyectos();
    if (btn.dataset.section === 'tareas') cargarTareas();
    if (btn.dataset.section === 'miembros') cargarMiembros();
  });
});

// ===== MIEMBROS =====

async function cargarMiembros() {
  try {
    const miembros = await fetchJSON(`${API}/miembros`);
    const tbody = document.getElementById('tbody-miembros');

    if (miembros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No hay miembros registrados</td></tr>';
      return;
    }

    tbody.innerHTML = miembros.map(m => `
      <tr>
        <td>${m.nombre}</td>
        <td>${m.email}</td>
        <td>${m.rol}</td>
        <td class="acciones">
          <button class="btn btn-sm btn-secondary" onclick="editarMiembro(${m.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarMiembro(${m.id}, '${m.nombre}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

function abrirModalMiembro() {
  document.getElementById('modal-miembro-titulo').textContent = 'Nuevo Miembro';
  document.getElementById('form-miembro').reset();
  document.getElementById('miembro-id').value = '';
  document.getElementById('modal-miembro').classList.remove('hidden');
}

function cerrarModalMiembro() {
  document.getElementById('modal-miembro').classList.add('hidden');
}

async function editarMiembro(id) {
  try {
    const m = await fetchJSON(`${API}/miembros/${id}`);
    document.getElementById('modal-miembro-titulo').textContent = 'Editar Miembro';
    document.getElementById('miembro-id').value = m.id;
    document.getElementById('miembro-nombre').value = m.nombre;
    document.getElementById('miembro-email').value = m.email;
    document.getElementById('miembro-rol').value = m.rol;
    document.getElementById('modal-miembro').classList.remove('hidden');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function eliminarMiembro(id, nombre) {
  if (!confirm(`¿Eliminar al miembro "${nombre}"?`)) return;
  try {
    await fetchJSON(`${API}/miembros/${id}`, { method: 'DELETE' });
    mostrarNotificacion('Miembro eliminado');
    cargarMiembros();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

document.getElementById('form-miembro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('miembro-id').value;
  const body = JSON.stringify({
    nombre: document.getElementById('miembro-nombre').value.trim(),
    email: document.getElementById('miembro-email').value.trim(),
    rol: document.getElementById('miembro-rol').value
  });

  try {
    if (id) {
      await fetchJSON(`${API}/miembros/${id}`, { method: 'PUT', body });
      mostrarNotificacion('Miembro actualizado');
    } else {
      await fetchJSON(`${API}/miembros`, { method: 'POST', body });
      mostrarNotificacion('Miembro creado');
    }
    cerrarModalMiembro();
    cargarMiembros();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

document.getElementById('btn-nuevo-miembro').addEventListener('click', abrirModalMiembro);
document.getElementById('cerrar-modal-miembro').addEventListener('click', cerrarModalMiembro);
document.getElementById('cancelar-miembro').addEventListener('click', cerrarModalMiembro);

// ===== PROYECTOS =====

async function cargarSelectMiembros() {
  try {
    const miembros = await fetchJSON(`${API}/miembros`);
    const selects = [
      document.getElementById('proyecto-responsable'),
      document.getElementById('tarea-miembro')
    ];

    selects.forEach(sel => {
      const valorActual = sel.value;
      const primeraOpcion = sel.options[0].outerHTML;
      sel.innerHTML = primeraOpcion + miembros.map(m =>
        `<option value="${m.id}">${m.nombre}</option>`
      ).join('');
      sel.value = valorActual;
    });
  } catch (error) {
    console.error('Error cargando miembros:', error);
  }
}

async function cargarSelectProyectos() {
  try {
    const proyectos = await fetchJSON(`${API}/proyectos`);
    const selects = [
      document.getElementById('tarea-proyecto'),
      document.getElementById('filtro-proyecto')
    ];

    selects.forEach(sel => {
      const valorActual = sel.value;
      const primeraOpcion = sel.options[0].outerHTML;
      sel.innerHTML = primeraOpcion + proyectos.map(p =>
        `<option value="${p.id}">${p.nombre}</option>`
      ).join('');
      sel.value = valorActual;
    });
  } catch (error) {
    console.error('Error cargando proyectos:', error);
  }
}

async function cargarProyectos() {
  try {
    const proyectos = await fetchJSON(`${API}/proyectos`);
    const contenedor = document.getElementById('lista-proyectos');

    if (proyectos.length === 0) {
      contenedor.innerHTML = '<div class="empty-message">No hay proyectos. Crea el primero.</div>';
      return;
    }

    contenedor.innerHTML = proyectos.map(p => `
      <article class="card">
        <h3 class="card-title">${p.nombre}</h3>
        <p class="card-desc">${p.descripcion || 'Sin descripción'}</p>
        <div class="card-meta">
          ${badgeEstado(p.estado)}
          <span>Responsable: ${p.responsable}</span>
          <span>${formatearFecha(p.fecha_inicio)} — ${formatearFecha(p.fecha_fin)}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" onclick="editarProyecto(${p.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProyecto(${p.id}, '${p.nombre}')">Eliminar</button>
        </div>
      </article>
    `).join('');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function abrirModalProyecto() {
  await cargarSelectMiembros();
  document.getElementById('modal-proyecto-titulo').textContent = 'Nuevo Proyecto';
  document.getElementById('form-proyecto').reset();
  document.getElementById('proyecto-id').value = '';
  document.getElementById('modal-proyecto').classList.remove('hidden');
}

function cerrarModalProyecto() {
  document.getElementById('modal-proyecto').classList.add('hidden');
}

async function editarProyecto(id) {
  try {
    await cargarSelectMiembros();
    const p = await fetchJSON(`${API}/proyectos/${id}`);
    document.getElementById('modal-proyecto-titulo').textContent = 'Editar Proyecto';
    document.getElementById('proyecto-id').value = p.id;
    document.getElementById('proyecto-nombre').value = p.nombre;
    document.getElementById('proyecto-descripcion').value = p.descripcion || '';
    document.getElementById('proyecto-fecha-inicio').value = p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '';
    document.getElementById('proyecto-fecha-fin').value = p.fecha_fin ? p.fecha_fin.split('T')[0] : '';
    document.getElementById('proyecto-estado').value = p.estado;
    document.getElementById('proyecto-responsable').value = p.miembro_id;
    document.getElementById('modal-proyecto').classList.remove('hidden');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function eliminarProyecto(id, nombre) {
  if (!confirm(`¿Eliminar el proyecto "${nombre}" y todas sus tareas?`)) return;
  try {
    await fetchJSON(`${API}/proyectos/${id}`, { method: 'DELETE' });
    mostrarNotificacion('Proyecto eliminado');
    cargarProyectos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

document.getElementById('form-proyecto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('proyecto-id').value;
  const body = JSON.stringify({
    nombre: document.getElementById('proyecto-nombre').value.trim(),
    descripcion: document.getElementById('proyecto-descripcion').value.trim(),
    fecha_inicio: document.getElementById('proyecto-fecha-inicio').value,
    fecha_fin: document.getElementById('proyecto-fecha-fin').value || null,
    estado: document.getElementById('proyecto-estado').value,
    miembro_id: document.getElementById('proyecto-responsable').value
  });

  try {
    if (id) {
      await fetchJSON(`${API}/proyectos/${id}`, { method: 'PUT', body });
      mostrarNotificacion('Proyecto actualizado');
    } else {
      await fetchJSON(`${API}/proyectos`, { method: 'POST', body });
      mostrarNotificacion('Proyecto creado');
    }
    cerrarModalProyecto();
    cargarProyectos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

document.getElementById('btn-nuevo-proyecto').addEventListener('click', abrirModalProyecto);
document.getElementById('cerrar-modal-proyecto').addEventListener('click', cerrarModalProyecto);
document.getElementById('cancelar-proyecto').addEventListener('click', cerrarModalProyecto);

// ===== TAREAS =====

async function cargarTareas() {
  try {
    await cargarSelectMiembros();
    await cargarSelectProyectos();

    const filtro = document.getElementById('filtro-proyecto').value;
    const url = filtro ? `${API}/tareas?proyecto_id=${filtro}` : `${API}/tareas`;
    const tareas = await fetchJSON(url);
    const tbody = document.getElementById('tbody-tareas');

    if (tareas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No hay tareas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = tareas.map(t => `
      <tr>
        <td>${t.titulo}</td>
        <td>${t.proyecto_nombre}</td>
        <td>${t.asignado || 'Sin asignar'}</td>
        <td>${badgePrioridad(t.prioridad)}</td>
        <td>${badgeEstado(t.estado)}</td>
        <td>${formatearFecha(t.fecha_limite)}</td>
        <td class="acciones">
          <button class="btn btn-sm btn-secondary" onclick="editarTarea(${t.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarTarea(${t.id}, '${t.titulo}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function abrirModalTarea() {
  await cargarSelectMiembros();
  await cargarSelectProyectos();
  document.getElementById('modal-tarea-titulo').textContent = 'Nueva Tarea';
  document.getElementById('form-tarea').reset();
  document.getElementById('tarea-id').value = '';
  document.getElementById('modal-tarea').classList.remove('hidden');
}

function cerrarModalTarea() {
  document.getElementById('modal-tarea').classList.add('hidden');
}

async function editarTarea(id) {
  try {
    await cargarSelectMiembros();
    await cargarSelectProyectos();
    const t = await fetchJSON(`${API}/tareas/${id}`);
    document.getElementById('modal-tarea-titulo').textContent = 'Editar Tarea';
    document.getElementById('tarea-id').value = t.id;
    document.getElementById('tarea-titulo').value = t.titulo;
    document.getElementById('tarea-descripcion').value = t.descripcion || '';
    document.getElementById('tarea-proyecto').value = t.proyecto_id;
    document.getElementById('tarea-miembro').value = t.miembro_id || '';
    document.getElementById('tarea-prioridad').value = t.prioridad;
    document.getElementById('tarea-estado').value = t.estado;
    document.getElementById('tarea-fecha-limite').value = t.fecha_limite ? t.fecha_limite.split('T')[0] : '';
    document.getElementById('modal-tarea').classList.remove('hidden');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function eliminarTarea(id, titulo) {
  if (!confirm(`¿Eliminar la tarea "${titulo}"?`)) return;
  try {
    await fetchJSON(`${API}/tareas/${id}`, { method: 'DELETE' });
    mostrarNotificacion('Tarea eliminada');
    cargarTareas();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

document.getElementById('form-tarea').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('tarea-id').value;
  const body = JSON.stringify({
    titulo: document.getElementById('tarea-titulo').value.trim(),
    descripcion: document.getElementById('tarea-descripcion').value.trim(),
    proyecto_id: document.getElementById('tarea-proyecto').value,
    miembro_id: document.getElementById('tarea-miembro').value || null,
    prioridad: document.getElementById('tarea-prioridad').value,
    estado: document.getElementById('tarea-estado').value,
    fecha_limite: document.getElementById('tarea-fecha-limite').value || null
  });

  try {
    if (id) {
      await fetchJSON(`${API}/tareas/${id}`, { method: 'PUT', body });
      mostrarNotificacion('Tarea actualizada');
    } else {
      await fetchJSON(`${API}/tareas`, { method: 'POST', body });
      mostrarNotificacion('Tarea creada');
    }
    cerrarModalTarea();
    cargarTareas();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

document.getElementById('btn-nueva-tarea').addEventListener('click', abrirModalTarea);
document.getElementById('cerrar-modal-tarea').addEventListener('click', cerrarModalTarea);
document.getElementById('cancelar-tarea').addEventListener('click', cerrarModalTarea);
document.getElementById('filtro-proyecto').addEventListener('change', cargarTareas);

// ===== Inicialización =====

document.addEventListener('DOMContentLoaded', () => {
  cargarProyectos();
});

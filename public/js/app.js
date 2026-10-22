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

// ===== Navegación (Sidebar) =====

const sectionTitles = {
  inicio: 'Inicio',
  proyectos: 'Proyectos',
  tareas: 'Tareas',
  miembros: 'Miembros del Equipo'
};

function navegarA(seccion) {
  document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });

  const btn = document.querySelector(`.sidebar-link[data-section="${seccion}"]`);
  if (btn) btn.classList.add('active');

  const sec = document.getElementById(`sec-${seccion}`);
  sec.classList.remove('hidden');
  sec.classList.add('active');

  document.querySelector('.topbar-title h2').textContent = sectionTitles[seccion] || seccion;

  if (seccion === 'inicio') cargarInicio();
  if (seccion === 'proyectos') cargarProyectos();
  if (seccion === 'tareas') cargarTareas();
  if (seccion === 'miembros') cargarMiembros();
}

document.querySelectorAll('.sidebar-link').forEach(btn => {
  btn.addEventListener('click', () => navegarA(btn.dataset.section));
});

// Sidebar toggle (responsive)
document.getElementById('toggle-sidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Panel de miembros del proyecto (sidebar)
async function mostrarMiembrosProyecto(proyectoId, nombreProyecto) {
  const panel = document.getElementById('panel-miembros-proyecto');
  const titulo = document.getElementById('panel-miembros-titulo');
  const lista = document.getElementById('panel-miembros-lista');

  titulo.textContent = nombreProyecto;
  lista.innerHTML = '<div class="sidebar-miembro"><span style="color:#8899aa">Cargando...</span></div>';
  panel.classList.remove('hidden');

  try {
    const miembros = await fetchJSON(`${API}/proyectos/${proyectoId}/miembros`);

    if (miembros.length === 0) {
      lista.innerHTML = '<div class="sidebar-miembro"><span style="color:#8899aa">Sin miembros asignados</span></div>';
      return;
    }

    lista.innerHTML = miembros.map(m => {
      const iniciales = m.nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const tipo = m.participacion.toLowerCase();
      return `
        <div class="sidebar-miembro">
          <div class="miembro-avatar ${tipo}">${iniciales}</div>
          <div class="miembro-info">
            <div class="miembro-info-nombre">${m.nombre}</div>
            <div class="miembro-info-rol">${m.participacion} · ${m.rol}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    lista.innerHTML = '<div class="sidebar-miembro"><span style="color:#ea4335">Error al cargar</span></div>';
  }
}

document.getElementById('cerrar-panel-miembros').addEventListener('click', () => {
  document.getElementById('panel-miembros-proyecto').classList.add('hidden');
});

// ===== MIEMBROS =====

async function cargarMiembros() {
  try {
    const miembros = await fetchJSON(`${API}/miembros`);
    const tbody = document.getElementById('tbody-miembros');

    if (miembros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No hay miembros registrados</td></tr>';
      return;
    }

    tbody.innerHTML = miembros.map(m => `
      <tr>
        <td><input type="checkbox" disabled></td>
        <td class="td-id">MB-${String(m.id).padStart(2, '0')}</td>
        <td class="td-name">${m.nombre}</td>
        <td>${m.email}</td>
        <td>${m.rol}</td>
        <td class="acciones">
          <button class="btn-action" onclick="editarMiembro(${m.id})">Editar</button>
          <button class="btn-action-danger" onclick="eliminarMiembro(${m.id}, '${m.nombre}')">Eliminar</button>
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
    const tbody = document.getElementById('tbody-proyectos');

    // Sidebar: proyectos recientes (clickeables para ver miembros)
    const sidebarRecientes = document.getElementById('sidebar-proyectos-recientes');
    sidebarRecientes.innerHTML = proyectos.map(p =>
      `<div class="sidebar-recent-item" data-proyecto-id="${p.id}" data-proyecto-nombre="${p.nombre}">${p.nombre}</div>`
    ).join('');

    sidebarRecientes.querySelectorAll('.sidebar-recent-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        mostrarMiembrosProyecto(item.dataset.proyectoId, item.dataset.proyectoNombre);
      });
    });

    if (proyectos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-message">No hay proyectos. Crea el primero.</td></tr>';
      return;
    }

    tbody.innerHTML = proyectos.map(p => `
      <tr>
        <td><input type="checkbox" disabled></td>
        <td class="td-id">PY-${String(p.id).padStart(2, '0')}</td>
        <td class="td-name">${p.nombre}</td>
        <td class="td-desc">${p.descripcion || 'Sin descripción'}</td>
        <td class="td-secondary">${p.responsable}</td>
        <td>${badgeEstado(p.estado)}</td>
        <td class="td-secondary">${formatearFecha(p.fecha_inicio)}</td>
        <td class="td-secondary">${formatearFecha(p.fecha_fin)}</td>
        <td class="acciones">
          <button class="btn-action" onclick="editarProyecto(${p.id})">Editar</button>
          <button class="btn-action-danger" onclick="eliminarProyecto(${p.id}, '${p.nombre}')">Eliminar</button>
        </td>
      </tr>
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
      tbody.innerHTML = '<tr><td colspan="9" class="empty-message">No hay tareas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = tareas.map(t => `
      <tr>
        <td><input type="checkbox" disabled></td>
        <td class="td-id">TR-${String(t.id).padStart(2, '0')}</td>
        <td class="td-name">${t.titulo}</td>
        <td class="td-secondary">${t.proyecto_nombre}</td>
        <td class="td-secondary">${t.asignado || 'Sin asignar'}</td>
        <td>${badgePrioridad(t.prioridad)}</td>
        <td>${badgeEstado(t.estado)}</td>
        <td class="td-secondary">${formatearFecha(t.fecha_limite)}</td>
        <td class="acciones">
          <button class="btn-action" onclick="editarTarea(${t.id})">Editar</button>
          <button class="btn-action-danger" onclick="eliminarTarea(${t.id}, '${t.titulo}')">Eliminar</button>
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

// ===== INICIO =====

async function cargarInicio() {
  try {
    const [proyectos, tareas, miembros] = await Promise.all([
      fetchJSON(`${API}/proyectos`),
      fetchJSON(`${API}/tareas`),
      fetchJSON(`${API}/miembros`)
    ]);

    document.getElementById('stat-proyectos').textContent = proyectos.length;
    document.getElementById('stat-tareas').textContent = tareas.length;
    document.getElementById('stat-miembros').textContent = miembros.length;

    // Sidebar: proyectos recientes
    const sidebarRecientes = document.getElementById('sidebar-proyectos-recientes');
    sidebarRecientes.innerHTML = proyectos.map(p =>
      `<div class="sidebar-recent-item" data-proyecto-id="${p.id}" data-proyecto-nombre="${p.nombre}">${p.nombre}</div>`
    ).join('');
    sidebarRecientes.querySelectorAll('.sidebar-recent-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        mostrarMiembrosProyecto(item.dataset.proyectoId, item.dataset.proyectoNombre);
      });
    });
  } catch (error) {
    console.error('Error cargando inicio:', error);
  }
}

document.getElementById('btn-comenzar').addEventListener('click', () => {
  navegarA('proyectos');
});

// ===== Inicialización =====

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.topbar-title h2').textContent = 'Inicio';
  cargarInicio();
});

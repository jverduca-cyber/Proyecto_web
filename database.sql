-- ================================================
-- Gestor de Proyectos - Base de Datos
-- ================================================

CREATE DATABASE IF NOT EXISTS gestor_proyectos;
USE gestor_proyectos;

-- Tabla: miembros
CREATE TABLE miembros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    rol VARCHAR(50) NOT NULL DEFAULT 'Desarrollador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: proyectos
CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado ENUM('Planificación', 'En progreso', 'Completado', 'Cancelado') NOT NULL DEFAULT 'Planificación',
    miembro_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE RESTRICT
);

-- Tabla: tareas
CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('Pendiente', 'En progreso', 'Completada') NOT NULL DEFAULT 'Pendiente',
    prioridad ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
    fecha_limite DATE,
    proyecto_id INT NOT NULL,
    miembro_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE SET NULL
);

-- ================================================
-- Datos iniciales para demostración
-- ================================================

INSERT INTO miembros (nombre, email, rol) VALUES
('Ana López', 'ana.lopez@email.com', 'Líder de Proyecto'),
('Carlos García', 'carlos.garcia@email.com', 'Desarrollador'),
('María Fernández', 'maria.fernandez@email.com', 'Diseñadora'),
('José Ramírez', 'jose.ramirez@email.com', 'QA Tester');

INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id) VALUES
('Sitio Web Corporativo', 'Rediseño del sitio web principal de la empresa', '2026-10-01', '2026-12-15', 'En progreso', 1),
('App de Inventario', 'Sistema para gestionar inventario del almacén', '2026-09-15', '2026-11-30', 'Planificación', 2),
('Portal de Clientes', 'Plataforma de autoservicio para clientes', '2026-08-01', '2026-10-30', 'Completado', 1);

INSERT INTO tareas (titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id) VALUES
('Diseñar mockups', 'Crear wireframes y mockups de las páginas principales', 'Completada', 'Alta', '2026-10-10', 1, 3),
('Implementar header', 'Maquetar header responsive con menú de navegación', 'En progreso', 'Alta', '2026-10-20', 1, 2),
('Configurar base de datos', 'Crear esquema de BD para el inventario', 'Pendiente', 'Media', '2026-10-25', 2, 2),
('Escribir pruebas', 'Pruebas funcionales del portal de clientes', 'Completada', 'Media', '2026-10-15', 3, 4),
('Optimizar rendimiento', 'Reducir tiempos de carga del sitio web', 'Pendiente', 'Baja', '2026-11-01', 1, 2),
('Diseñar logo', 'Propuesta de nuevo logotipo para el sitio', 'En progreso', 'Media', '2026-10-18', 1, 3);

-- ============================================================
-- SCRIPT DDL: GESTOR DE PROYECTOS
-- Base de datos relacional para gestionar miembros, proyectos y tareas.
-- Incluye restricciones de integridad referencial y UTF-8.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREACIÓN Y SELECCIÓN DE LA BASE DE DATOS
-- ------------------------------------------------------------
-- Crear la base de datos solo si no existe previamente (idempotencia)
CREATE DATABASE IF NOT EXISTS gestor_proyectos
    CHARACTER SET utf8mb4           -- Soporte para caracteres multilingües, tildes y emojis
    COLLATE utf8mb4_unicode_ci;     -- Comparación insensible a mayúsculas/minúsculas y acentos

-- Seleccionar la base de datos activa para ejecutar el script
USE gestor_proyectos;

-- ------------------------------------------------------------
-- 2. TABLA: miembros
-- Registra los usuarios e integrantes del sistema.
-- ------------------------------------------------------------
CREATE TABLE miembros (
    -- Clave primaria autoincremental para cada miembro
    id         INT AUTO_INCREMENT PRIMARY KEY,
    -- Nombre completo del usuario (Obligatorio)
    nombre     VARCHAR(100) NOT NULL,
    -- Correo electrónico único para evitar cuentas duplicadas (Obligatorio)
    email      VARCHAR(150) NOT NULL UNIQUE,
    -- Rol del usuario dentro del equipo (Por defecto: 'Desarrollador')
    rol        VARCHAR(50)  NOT NULL DEFAULT 'Desarrollador',
    -- Fecha y hora de registro (Asignada automáticamente por el servidor)
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB; -- Motor InnoDB habilitado para soporte de claves foráneas y transacciones

-- ------------------------------------------------------------
-- 3. TABLA: proyectos
-- Almacena los proyectos creados y vinculados a un responsable.
-- ------------------------------------------------------------
CREATE TABLE proyectos (
    -- Clave primaria autoincremental del proyecto
    id           INT AUTO_INCREMENT PRIMARY KEY,
    -- Nombre o título corto del proyecto (Obligatorio)
    nombre       VARCHAR(150) NOT NULL,
    -- Descripción extensa del alcance del proyecto (Opcional)
    descripcion  TEXT,
    -- Fecha programada de inicio (Obligatoria)
    fecha_inicio DATE         NOT NULL,
    -- Fecha estimada o real de cierre (Opcional)
    fecha_fin    DATE,
    -- Estado restringido a valores específicos (Por defecto: 'Planificación')
    estado       ENUM('Planificación', 'En progreso', 'Completado', 'Cancelado')
                 NOT NULL DEFAULT 'Planificación',
    -- ID del miembro responsable/líder del proyecto (Clave Foránea, Obligatorio)
    miembro_id   INT          NOT NULL,
    -- Fecha y hora de creación del registro
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    -- RESTRICCIÓN DE INTEGRIDAD REFERENCIAL:
    -- ON DELETE RESTRICT: Protege la base de datos impidiendo borrar un miembro que lidera proyectos.
    -- ON UPDATE CASCADE:  Si el ID del miembro cambia, se actualiza automáticamente en esta tabla.
    CONSTRAINT fk_proyectos_miembros
        FOREIGN KEY (miembro_id) REFERENCES miembros(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. TABLA: tareas
-- Registra las tareas pertenecientes a un proyecto y asignadas a miembros.
-- ------------------------------------------------------------
CREATE TABLE tareas (
    -- Clave primaria autoincremental de la tarea
    id           INT AUTO_INCREMENT PRIMARY KEY,
    -- Título o resumen de la tarea (Obligatorio)
    titulo       VARCHAR(200) NOT NULL,
    -- Descripción detallada de la tarea (Opcional)
    descripcion  TEXT,
    -- Estado actual de la tarea dentro del flujo de trabajo (Por defecto: 'Pendiente')
    estado       ENUM('Pendiente', 'En progreso', 'Completada')
                 NOT NULL DEFAULT 'Pendiente',
    -- Nivel de prioridad o urgencia de la tarea (Por defecto: 'Media')
    prioridad    ENUM('Baja', 'Media', 'Alta')
                 NOT NULL DEFAULT 'Media',
    -- Fecha límite para la entrega de la tarea (Opcional)
    fecha_limite DATE,
    -- ID del proyecto al que pertenece obligatoriamente la tarea (Clave Foránea)
    proyecto_id  INT          NOT NULL,
    -- ID del miembro asignado para realizar la tarea (Clave Foránea, Opcional)
    miembro_id   INT          NULL,
    -- Fecha y hora de creación del registro
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    -- RESTRICCIÓN FK A PROYECTOS:
    -- ON DELETE CASCADE: Si se elimina el proyecto, se borran automáticamente todas sus tareas.
    CONSTRAINT fk_tareas_proyectos
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- RESTRICCIÓN FK A MIEMBROS:
    -- ON DELETE SET NULL: Si el miembro asignado es eliminado, la tarea no se borra, solo queda sin asignar (NULL).
    CONSTRAINT fk_tareas_miembros
        FOREIGN KEY (miembro_id) REFERENCES miembros(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. DATOS INICIALES PARA DEMOSTRACIÓN
-- Registros de ejemplo para verificar el funcionamiento del sistema.
-- ============================================================

INSERT INTO miembros (nombre, email, rol) VALUES
('Ana López', 'ana.lopez@email.com', 'Líder de Proyecto'),
('Carlos García', 'carlos.garcia@email.com', 'Desarrollador'),
('María Fernández', 'maria.fernandez@email.com', 'Diseñadora'),
('José Ramírez', 'jose.ramirez@email.com', 'QA Tester'),
('Laura Mendoza', 'laura.mendoza@email.com', 'Scrum Master'),
('Diego Castillo', 'diego.castillo@email.com', 'Desarrollador');

INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado, miembro_id) VALUES
('Sitio Web Corporativo', 'Rediseño del sitio web principal de la empresa', '2026-10-01', '2026-12-15', 'En progreso', 1),
('App de Inventario', 'Sistema para gestionar inventario del almacén', '2026-09-15', '2026-11-30', 'Planificación', 2),
('Portal de Clientes', 'Plataforma de autoservicio para clientes', '2026-08-01', '2026-10-30', 'Completado', 1),
('Sistema de Reportes', 'Dashboard de reportes y métricas del equipo', '2026-10-15', '2026-12-01', 'En progreso', 5);

INSERT INTO tareas (titulo, descripcion, estado, prioridad, fecha_limite, proyecto_id, miembro_id) VALUES
('Diseñar mockups', 'Crear wireframes y mockups de las páginas principales', 'Completada', 'Alta', '2026-10-10', 1, 3),
('Implementar header', 'Maquetar header responsive con menú de navegación', 'En progreso', 'Alta', '2026-10-20', 1, 2),
('Configurar base de datos', 'Crear esquema de BD para el inventario', 'Pendiente', 'Media', '2026-10-25', 2, 2),
('Escribir pruebas', 'Pruebas funcionales del portal de clientes', 'Completada', 'Media', '2026-10-15', 3, 4),
('Optimizar rendimiento', 'Reducir tiempos de carga del sitio web', 'Pendiente', 'Baja', '2026-11-01', 1, 2),
('Diseñar logo', 'Propuesta de nuevo logotipo para el sitio', 'En progreso', 'Media', '2026-10-18', 1, 3),
('Crear dashboard', 'Implementar gráficas y KPIs del sistema de reportes', 'Pendiente', 'Alta', '2026-11-10', 4, 6),
('Documentar API', 'Escribir documentación de los endpoints REST', 'En progreso', 'Media', '2026-11-05', 1, 5);

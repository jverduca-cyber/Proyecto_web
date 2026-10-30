# Gestor de Proyectos

Aplicación web Full Stack para la gestión de proyectos, tareas y miembros de equipo.

## Integrantes

| Nombre | Carné | Rol |
|--------|-------|-----|
| Ricardo Andrés Gill Moreno | 0900-22-13694 | Backend Developer |
| Carlos Humberto Interiano Garzona | 0900-23-1399 | Frontend Developer |
| Juan Pablo Verdúca Aceituno | 0900-22-717 | Full Stack Developer & DBA |

## Descripción

Sistema que permite a los equipos de trabajo organizar sus proyectos, asignar tareas a miembros y dar seguimiento al estado de cada actividad. Resuelve la necesidad de tener un punto central para administrar el trabajo colaborativo.

## Problema que resuelve

La falta de organización en equipos de desarrollo genera retrasos y duplicación de esfuerzos. Este gestor permite crear proyectos, dividirlos en tareas, asignar responsables y monitorear el avance de cada tarea.

## Tecnologías utilizadas

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (vanilla)   |
| Backend    | Node.js, Express                    |
| Base de datos | MySQL                            |
| Otros      | dotenv, cors, mysql2                |

## Arquitectura

```
Usuario → Frontend (HTML + CSS + JS) → fetch/HTTP → API REST (Express) → MySQL
```

El frontend consume la API REST mediante `fetch()` con `async/await`. El backend expone endpoints RESTful que ejecutan consultas parametrizadas contra MySQL.

### Estructura del proyecto

```
├── server.js            # Servidor Express
├── db.js                # Conexión a MySQL
├── routes/
│   ├── miembros.js      # CRUD miembros
│   ├── proyectos.js     # CRUD proyectos
│   └── tareas.js        # CRUD tareas
├── public/
│   ├── index.html       # Página principal
│   ├── css/styles.css   # Estilos
│   └── js/app.js        # Lógica frontend
├── database.sql         # Script de base de datos
├── .env.example         # Variables de entorno (plantilla)
└── package.json         # Dependencias Node.js
```

## Base de datos

Tres tablas relacionadas:

- **miembros**: información del equipo (nombre, email, rol)
- **proyectos**: proyectos con estado y responsable (FK → miembros)
- **tareas**: tareas asignadas a proyectos y miembros (FK → proyectos, FK → miembros)

## API REST — Endpoints

### Miembros `/api/miembros`
| Método | Ruta                | Descripción           |
|--------|---------------------|-----------------------|
| GET    | /api/miembros       | Listar todos          |
| GET    | /api/miembros/:id   | Obtener uno           |
| POST   | /api/miembros       | Crear miembro         |
| PUT    | /api/miembros/:id   | Actualizar miembro    |
| DELETE | /api/miembros/:id   | Eliminar miembro      |

### Proyectos `/api/proyectos`
| Método | Ruta                 | Descripción           |
|--------|----------------------|-----------------------|
| GET    | /api/proyectos       | Listar todos          |
| GET    | /api/proyectos/:id   | Obtener uno           |
| POST   | /api/proyectos       | Crear proyecto        |
| PUT    | /api/proyectos/:id   | Actualizar proyecto   |
| DELETE | /api/proyectos/:id   | Eliminar proyecto     |

### Tareas `/api/tareas`
| Método | Ruta              | Descripción                          |
|--------|-------------------|--------------------------------------|
| GET    | /api/tareas       | Listar (filtro: ?proyecto_id=N)      |
| GET    | /api/tareas/:id   | Obtener una                          |
| POST   | /api/tareas       | Crear tarea                          |
| PUT    | /api/tareas/:id   | Actualizar tarea                     |
| DELETE | /api/tareas/:id   | Eliminar tarea                       |

## Instalación y ejecución

### Requisitos previos
- Node.js (v18 o superior)
- MySQL (v8 o superior)

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/jverduca-cyber/Proyecto_web.git
   cd Proyecto_web
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear la base de datos ejecutando el script SQL:
   ```bash
   mysql -u root -p < database.sql
   ```

4. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con las credenciales de MySQL.

5. Iniciar el servidor:
   ```bash
   npm start
   ```

6. Abrir en el navegador: `http://localhost:3000`

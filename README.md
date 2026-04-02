# KrakeDev - Aula Virtual

Sistema de gestión de aprendizaje (LMS) moderno para KrakeDev.

## Características

- 🎨 Diseño moderno estilo Netflix/Udemy
- 🌙 Tema oscuro profesional
- 📱 Responsive design
- 🎥 Reproductor de video integrado
- 📊 Seguimiento de progreso
- 🔒 Sistema de desbloqueo secuencial
- 📅 Módulo de tutorías
- 👨‍💼 Panel de administración

## Stack Tecnológico

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Estructura del Proyecto

```
src/
├── pages/          # Pantallas principales
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── CourseView.tsx
│   ├── VideoPlayer.tsx
│   ├── Tutoring.tsx
│   └── Admin.tsx
├── components/     # Componentes reutilizables
│   ├── Navbar.tsx
│   ├── CourseCard.tsx
│   ├── HeroSection.tsx
│   ├── StatsCard.tsx
│   └── VideoList.tsx
├── layouts/        # Layouts
│   └── MainLayout.tsx
├── routes/         # Configuración de rutas
│   └── AppRoutes.tsx
├── models/         # Tipos TypeScript
│   └── types.ts
└── utils/          # Utilidades
    └── mockData.ts
```

## Instalación

```bash
npm install
```

## Configuración del Backend

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar la URL del Backend

Edita el archivo `.env` y configura la URL de tu backend:

```env
VITE_API_BASE_URL=https://backend-aula-virtual.onrender.com/api
VITE_GOOGLE_CLIENT_ID=tu-google-client-id
VITE_ENV=development
```

### 3. Estructura de la API

El frontend espera que el backend implemente los siguientes endpoints:

#### Autenticación
- `POST /api/auth/login` - Login con Google OAuth
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

#### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil

#### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener curso específico
- `GET /api/courses/:id/videos` - Obtener videos del curso

#### Videos
- `GET /api/videos/:id` - Obtener video específico
- `POST /api/videos/:id/progress` - Actualizar progreso del video

#### Desafíos
- `POST /api/challenges/submit` - Enviar desafío
- `GET /api/challenges/submissions/:videoId` - Obtener entregas

#### Tutorías
- `GET /api/tutorings` - Listar tutorías
- `POST /api/tutorings` - Crear tutoría
- `POST /api/tutorings/:id/confirm` - Confirmar tutoría
- `POST /api/tutorings/:id/complete` - Completar tutoría

#### Insignias
- `GET /api/badges` - Listar todas las insignias
- `GET /api/badges/user` - Obtener insignias del usuario

#### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `POST /api/notifications/:id/read` - Marcar como leída
- `POST /api/notifications/mark-all-read` - Marcar todas como leídas

#### Reportes
- `GET /api/reports/daily` - Reporte diario
- `GET /api/reports/students` - Reportes de estudiantes

#### Admin
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/courses` - Listar cursos (admin)
- `POST /api/admin/courses` - Crear curso
- `PUT /api/admin/courses/:id` - Actualizar curso
- `DELETE /api/admin/courses/:id` - Eliminar curso

### 4. Autenticación

El frontend envía el token JWT en el header `Authorization`:

```
Authorization: Bearer <token>
```

El token se almacena en `localStorage` después del login exitoso.

### 5. Manejo de Errores

- `401 Unauthorized` - Redirige automáticamente al login
- Otros errores se propagan para manejo específico en componentes

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Rutas

- `/` - Landing page
- `/login` - Inicio de sesión
- `/dashboard` - Dashboard principal
- `/course/:id` - Vista de curso
- `/course/:id/video/:videoId` - Reproductor de video
- `/tutoring` - Agendar tutorías
- `/admin` - Panel de administración

# Guía de Integración con Backend

Este documento describe cómo integrar el frontend de KrakeDev con el backend.

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará `axios` que es necesario para las llamadas HTTP al backend.

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` con la configuración de tu backend:

```env
VITE_API_BASE_URL=https://backend-aula-virtual.onrender.com/api
VITE_GOOGLE_CLIENT_ID=tu-google-client-id-aqui
VITE_ENV=development
```

## Arquitectura de la API

### Servicio API (`src/services/api.ts`)

El servicio API está completamente configurado con:

- **Axios Instance**: Cliente HTTP configurado con interceptores
- **Interceptores de Request**: Añade automáticamente el token JWT a todas las peticiones
- **Interceptores de Response**: Maneja errores 401 y redirige al login
- **Endpoints Organizados**: Todos los endpoints están definidos en `API_ENDPOINTS`
- **Métodos de API**: Funciones wrapper para cada operación del backend

### Interceptores

#### Request Interceptor
```typescript
// Añade el token JWT automáticamente
config.headers.Authorization = `Bearer ${token}`;
```

#### Response Interceptor
```typescript
// Maneja errores 401 (no autorizado)
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

## Endpoints del Backend

### Autenticación

#### POST /api/auth/login
Login con Google OAuth

**Request:**
```json
{
  "token": "google-oauth-token"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Usuario",
    "email": "usuario@krakedev.com",
    "role": "student|tutor|admin"
  }
}
```

#### POST /api/auth/forgot-password
Solicitar recuperación de contraseña

**Request:**
```json
{
  "email": "usuario@krakedev.com"
}
```

**Response:**
```json
{
  "message": "Email enviado exitosamente"
}
```

### Cursos

#### GET /api/courses
Obtener lista de cursos del usuario

**Response:**
```json
[
  {
    "id": "course-id",
    "title": "Fundamentos de Programación",
    "description": "Descripción del curso",
    "thumbnail": "url-imagen",
    "progress": 45,
    "totalVideos": 20,
    "completedVideos": 9,
    "duration": "12 horas",
    "level": "Principiante",
    "instructor": "Instructor Name"
  }
]
```

#### GET /api/courses/:id
Obtener detalles de un curso específico

**Response:**
```json
{
  "id": "course-id",
  "title": "Fundamentos de Programación",
  "description": "Descripción completa",
  "thumbnail": "url-imagen",
  "blocks": [
    {
      "id": "block-id",
      "title": "Bloque 1: Introducción",
      "order": 1,
      "videos": [...]
    }
  ]
}
```

### Videos

#### GET /api/videos/:id
Obtener detalles de un video

**Response:**
```json
{
  "id": "video-id",
  "title": "Introducción a Variables",
  "description": "Descripción del video",
  "url": "video-url",
  "duration": "15:30",
  "hasChallenge": true,
  "challengeDescription": "Descripción del desafío",
  "completed": false,
  "progress": 0
}
```

#### POST /api/videos/:id/progress
Actualizar progreso de un video

**Request:**
```json
{
  "progress": 75,
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "progress": 75,
  "completed": true
}
```

### Desafíos

#### POST /api/challenges/submit
Enviar un desafío

**Request:**
```json
{
  "videoId": "video-id",
  "githubUrl": "https://github.com/user/repo",
  "notes": "Notas opcionales"
}
```

**Response:**
```json
{
  "id": "submission-id",
  "status": "pending",
  "submittedAt": "2024-03-26T10:00:00Z"
}
```

### Tutorías

#### GET /api/tutorings
Obtener lista de tutorías del usuario

**Response:**
```json
[
  {
    "id": "tutoring-id",
    "studentId": "student-id",
    "studentName": "Estudiante",
    "tutorId": "tutor-id",
    "tutorName": "Tutor",
    "date": "2024-03-26",
    "time": "14:00",
    "topic": "Dudas sobre POO",
    "notes": "Notas adicionales",
    "status": "pending|confirmed|completed|cancelled",
    "meetingUrl": "https://meet.google.com/xxx",
    "createdAt": "2024-03-25T10:00:00Z"
  }
]
```

#### POST /api/tutorings
Crear una nueva tutoría

**Request:**
```json
{
  "date": "2024-03-26",
  "time": "14:00",
  "topic": "Dudas sobre POO",
  "notes": "Necesito ayuda con herencia"
}
```

**Response:**
```json
{
  "id": "tutoring-id",
  "status": "pending",
  "createdAt": "2024-03-25T10:00:00Z"
}
```

#### POST /api/tutorings/:id/confirm
Confirmar una tutoría (solo tutores)

**Request:**
```json
{
  "meetingUrl": "https://meet.google.com/xxx"
}
```

**Response:**
```json
{
  "id": "tutoring-id",
  "status": "confirmed",
  "meetingUrl": "https://meet.google.com/xxx"
}
```

#### POST /api/tutorings/:id/complete
Completar una tutoría

**Request:**
```json
{
  "feedback": "Excelente sesión"
}
```

**Response:**
```json
{
  "id": "tutoring-id",
  "status": "completed"
}
```

### Insignias

#### GET /api/badges
Obtener todas las insignias disponibles

**Response:**
```json
[
  {
    "id": "badge-id",
    "name": "Primera Victoria",
    "description": "Completa tu primer video",
    "icon": "trophy",
    "category": "progress",
    "requirement": "Completar 1 video"
  }
]
```

#### GET /api/badges/user
Obtener insignias del usuario

**Response:**
```json
{
  "earned": [
    {
      "id": "badge-id",
      "name": "Primera Victoria",
      "earnedAt": "2024-03-20T10:00:00Z"
    }
  ],
  "available": [...],
  "locked": [...]
}
```

### Notificaciones

#### GET /api/notifications
Obtener notificaciones del usuario

**Response:**
```json
[
  {
    "id": "notif-id",
    "type": "tutoring|grade|badge|deadline|course|system",
    "title": "Tutoría Confirmada",
    "message": "Tu tutoría ha sido confirmada",
    "read": false,
    "createdAt": "2024-03-26T10:00:00Z",
    "relatedId": "tutoring-id"
  }
]
```

#### POST /api/notifications/:id/read
Marcar notificación como leída

**Response:**
```json
{
  "success": true
}
```

### Reportes

#### GET /api/reports/daily?date=2024-03-26
Obtener reporte diario

**Response:**
```json
{
  "date": "2024-03-26",
  "videosWatched": 3,
  "timeSpent": 120,
  "challengesCompleted": 2,
  "activitiesByHour": {
    "09:00": 2,
    "14:00": 1
  },
  "courseProgress": [
    {
      "courseId": "course-id",
      "courseName": "Fundamentos",
      "videosCompleted": 2,
      "timeSpent": 90
    }
  ]
}
```

### Admin

#### GET /api/admin/users
Obtener lista de usuarios (solo admin)

**Response:**
```json
[
  {
    "id": "user-id",
    "name": "Usuario",
    "email": "usuario@krakedev.com",
    "role": "student",
    "enrolledCourses": 3,
    "completedCourses": 1,
    "lastActivity": "2024-03-26T10:00:00Z"
  }
]
```

## Uso en Componentes

### Ejemplo: Login

```typescript
import { api } from '../services/api';

const handleLogin = async (googleToken: string) => {
  try {
    const response = await api.login(googleToken);
    // Token y usuario se guardan automáticamente en localStorage
    navigate('/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
    setError('Error al iniciar sesión');
  }
};
```

### Ejemplo: Obtener Cursos

```typescript
import { api } from '../services/api';

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const courses = await api.getCourses();
      setCourses(courses);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };
  
  fetchCourses();
}, []);
```

### Ejemplo: Actualizar Progreso

```typescript
import { api } from '../services/api';

const handleVideoComplete = async (videoId: string) => {
  try {
    await api.updateVideoProgress(videoId, 100, true);
    // Actualizar UI
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
  }
};
```

## Manejo de Errores

### Errores Globales

Los errores 401 (no autorizado) se manejan automáticamente:
- Se limpia el localStorage
- Se redirige al usuario al login

### Errores Específicos

Para otros errores, usa try-catch en los componentes:

```typescript
try {
  await api.someMethod();
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      // Recurso no encontrado
    } else if (error.response?.status === 500) {
      // Error del servidor
    }
  }
}
```

## Testing con Mock Data

Mientras el backend no esté disponible, el frontend usa datos mock de `src/utils/mockData.ts`.

Para cambiar entre mock y backend real:

1. **Modo Mock** (actual): Los componentes usan `mockData` directamente
2. **Modo Backend**: Reemplaza las importaciones de `mockData` con llamadas a `api`

Ejemplo de migración:

```typescript
// Antes (Mock)
import { mockCourses } from '../utils/mockData';
const courses = mockCourses;

// Después (Backend)
import { api } from '../services/api';
const courses = await api.getCourses();
```

## Seguridad

### Tokens JWT

- Se almacenan en `localStorage` con la clave `authToken`
- Se envían automáticamente en cada request
- Se eliminan automáticamente en logout o error 401

### CORS

Asegúrate de que tu backend permita requests desde el origen del frontend:

```javascript
// Ejemplo en Express.js
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend en desarrollo
  credentials: true
}));
```

## Producción

### Variables de Entorno

Para producción, crea un archivo `.env.production`:

```env
VITE_API_BASE_URL=https://api.krakedev.com/api
VITE_GOOGLE_CLIENT_ID=tu-google-client-id-produccion
VITE_ENV=production
```

### Build

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## Troubleshooting

### Error: "Network Error"
- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- Verifica configuración CORS en el backend

### Error: "401 Unauthorized"
- El token JWT expiró o es inválido
- El usuario será redirigido automáticamente al login

### Error: "Cannot read property of undefined"
- Verifica que la estructura de respuesta del backend coincida con la esperada
- Revisa los tipos en `src/models/types.ts`

## Próximos Pasos

1. Implementar el backend con los endpoints descritos
2. Probar cada endpoint con Postman o similar
3. Reemplazar mock data con llamadas reales a la API
4. Implementar refresh token para sesiones largas
5. Añadir logging y monitoreo de errores

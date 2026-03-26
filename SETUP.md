# Guía de Configuración Rápida - KrakeDev Aula Virtual

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias, incluyendo `axios` para las llamadas al backend.

### 2. Configurar Variables de Entorno

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Linux/Mac
cp .env.example .env
```

Edita el archivo `.env` con la configuración de tu backend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu-google-client-id
VITE_ENV=development
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📋 Credenciales de Prueba (Mock Data)

### Estudiante
- Email: `estudiante@krakedev.com`
- Contraseña: cualquiera (mock)

### Tutor
- Email: `tutor@krakedev.com`
- Contraseña: cualquiera (mock)

### Admin
- Email: `admin@krakedev.com`
- Contraseña: cualquiera (mock)

## 🔧 Configuración del Backend

### Requisitos del Backend

El backend debe implementar los siguientes endpoints (ver `BACKEND_INTEGRATION.md` para detalles completos):

- **Autenticación**: `/api/auth/*`
- **Cursos**: `/api/courses/*`
- **Videos**: `/api/videos/*`
- **Tutorías**: `/api/tutorings/*`
- **Insignias**: `/api/badges/*`
- **Notificaciones**: `/api/notifications/*`
- **Reportes**: `/api/reports/*`
- **Admin**: `/api/admin/*`

### Estructura de Autenticación

El frontend espera:

1. **Login**: `POST /api/auth/login` con token de Google OAuth
2. **Respuesta**: JWT token + datos del usuario
3. **Headers**: `Authorization: Bearer <token>` en todas las peticiones

### CORS

El backend debe permitir requests desde el frontend:

```javascript
// Ejemplo en Express.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## 📁 Estructura del Proyecto

```
src/
├── pages/              # Páginas principales
│   ├── Landing.tsx     # Página de inicio
│   ├── Login.tsx       # Login con Google OAuth
│   ├── Dashboard.tsx   # Dashboard del estudiante
│   ├── CourseView.tsx  # Vista de curso con bloques
│   ├── VideoPlayer.tsx # Reproductor de video
│   ├── Meetings.tsx    # Gestión de tutorías
│   ├── Tutor.tsx       # Dashboard del tutor
│   ├── Admin.tsx       # Panel de administración
│   ├── Reports.tsx     # Reportes diarios
│   └── ForgotPassword.tsx
├── components/         # Componentes reutilizables
│   ├── Navbar.tsx      # Barra de navegación
│   ├── CourseCard.tsx  # Tarjeta de curso
│   ├── Badge.tsx       # Sistema de insignias
│   └── ...
├── services/
│   └── api.ts          # Servicio de API con axios
├── models/
│   └── types.ts        # Tipos TypeScript
└── utils/
    ├── mockData.ts     # Datos de prueba
    └── constants.ts    # Constantes
```

## 🎨 Personalización

### Colores de Marca (KrakeDev)

Los colores están configurados en `tailwind.config.js`:

- **Rojo Principal**: `#DC2626` (red-600)
- **Negro**: `slate-900`, `slate-800`
- **Blanco**: `white`

### Logo

El logo debe estar en: `src/assets/krakedev_logo.png`

## 🔄 Migración de Mock a Backend Real

Actualmente, la aplicación usa datos mock de `src/utils/mockData.ts`.

Para conectar con el backend real:

1. Asegúrate de que el backend esté corriendo
2. Configura `VITE_API_BASE_URL` en `.env`
3. Los componentes ya están preparados para usar `api` de `src/services/api.ts`
4. Reemplaza las importaciones de `mockData` con llamadas a `api`

Ejemplo:

```typescript
// Antes (Mock)
import { mockCourses } from '../utils/mockData';
const courses = mockCourses;

// Después (Backend)
import { api } from '../services/api';
const courses = await api.getCourses();
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Fix linting automático
npm run lint:fix

# Type checking
npm run type-check
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'axios'"

```bash
npm install
```

### Error: "VITE_API_BASE_URL is not defined"

Asegúrate de tener el archivo `.env` con la configuración correcta.

### Error: "Network Error" al hacer login

- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- Verifica CORS en el backend

### El logo no se muestra

Asegúrate de que el archivo `src/assets/krakedev_logo.png` existe.

## 📚 Documentación Adicional

- `README.md` - Información general del proyecto
- `BACKEND_INTEGRATION.md` - Guía completa de integración con backend
- `FEATURES.md` - Lista de características implementadas
- `DEVELOPMENT.md` - Guía de desarrollo
- `DEPLOYMENT.md` - Guía de despliegue

## 🆘 Soporte

Para dudas o problemas:
- Email: contacto@krakedev.com
- Revisa la documentación en los archivos `.md`
- Verifica los logs en la consola del navegador

## ✅ Checklist de Configuración

- [ ] Ejecutar `npm install`
- [ ] Crear archivo `.env` desde `.env.example`
- [ ] Configurar `VITE_API_BASE_URL` con la URL del backend
- [ ] Verificar que el logo existe en `src/assets/krakedev_logo.png`
- [ ] Ejecutar `npm run dev`
- [ ] Probar login con credenciales mock
- [ ] Verificar que el backend está corriendo (cuando esté disponible)
- [ ] Configurar CORS en el backend
- [ ] Probar conexión con backend real

## 🎯 Próximos Pasos

1. **Backend**: Implementar los endpoints descritos en `BACKEND_INTEGRATION.md`
2. **Testing**: Probar cada endpoint con Postman
3. **Integración**: Reemplazar mock data con llamadas reales
4. **OAuth**: Configurar Google OAuth en producción
5. **Deploy**: Seguir guía en `DEPLOYMENT.md`

# Guía de Desarrollo - Clear Minds LMS

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Estructura de Archivos

### Pages (Páginas Principales)
- `Landing.tsx` - Página de inicio pública
- `Login.tsx` - Pantalla de inicio de sesión
- `Dashboard.tsx` - Dashboard principal del estudiante
- `CourseView.tsx` - Vista de curso con módulos
- `VideoPlayer.tsx` - Reproductor de video
- `Tutoring.tsx` - Agendar tutorías
- `Admin.tsx` - Panel de administración

### Components (Componentes Reutilizables)
- `Navbar.tsx` - Barra de navegación
- `CourseCard.tsx` - Tarjeta de curso
- `HeroSection.tsx` - Sección hero
- `StatsCard.tsx` - Card de estadísticas
- `VideoList.tsx` - Lista de videos
- `SearchBar.tsx` - Barra de búsqueda
- `Modal.tsx` - Modal genérico
- `Button.tsx` - Botón reutilizable
- `Badge.tsx` - Badge/etiqueta
- `ProgressBar.tsx` - Barra de progreso
- `PageHeader.tsx` - Header de página
- `LoadingSpinner.tsx` - Spinner de carga

### Layouts
- `MainLayout.tsx` - Layout principal con Navbar

### Routes
- `AppRoutes.tsx` - Configuración de rutas con React Router

### Models
- `types.ts` - Tipos TypeScript (User, Course, Module, Video, Tutoring)

### Utils
- `mockData.ts` - Datos de ejemplo
- `constants.ts` - Constantes (colores, rutas)
- `icons.ts` - Paths de iconos SVG

## Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/dashboard` | Dashboard principal |
| `/course/:id` | Vista de curso |
| `/course/:id/video/:videoId` | Reproductor de video |
| `/tutoring` | Agendar tutorías |
| `/admin` | Panel de administración |

## Paleta de Colores

- **Background**: slate-900, slate-800
- **Accent**: cyan-500, blue-500
- **Success**: green-500
- **Text**: white, slate-300, slate-400

## Categorías de Cursos

- STRATEGY (cyan)
- ANALYSIS (purple)
- LEADERSHIP (blue)
- INNOVATION (green)

## Próximas Funcionalidades

- [ ] Integración con backend real
- [ ] Autenticación con Google OAuth
- [ ] Sistema de notificaciones
- [ ] Chat en vivo
- [ ] Certificados de finalización
- [ ] Sistema de calificaciones
- [ ] Foros de discusión
- [ ] Modo offline

# Clear Minds LMS

Sistema de gestión de aprendizaje (LMS) moderno para Clear Minds Consulting.

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

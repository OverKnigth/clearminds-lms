# Plan de Implementación: generation-course-management

## Overview

Implementación incremental del rediseño del tab "Gestión de Cursos" introduciendo Generaciones como unidad organizativa central. Se construye primero el backend (endpoints + repositorio), luego los hooks y tipos del frontend, y finalmente los componentes de UI, terminando con la migración del tab `blocks`.

## Tasks

- [x] 1. Crear el controlador y casos de uso del backend para Generaciones
  - [x] 1.1 Crear `GenerationController` con los 9 endpoints definidos en el diseño
    - Archivo: `backend_aula_virtual/src/adapters/driving/http/generation/GenerationController.ts`
    - Implementar: GET/POST `/admin/generations`, GET/PATCH `/admin/generations/:id`, POST `/admin/generations/:id/courses`, GET/POST `/admin/generations/:id/parallels`, GET `/admin/parallels/:parallelId/students`, POST `/admin/parallels/:parallelId/enroll`
    - Validar campos requeridos (nombre vacío → 400, endDate < startDate → 400)
    - Capturar `PrismaClientKnownRequestError` código `P2002` → 409
    - _Requirements: 2.2, 2.3, 2.4, 2.6, 6.2, 6.3, 7.2_

  - [x] 1.2 Crear `PrismaGenerationRepositoryImpl` con toda la lógica de acceso a datos
    - Archivo: `backend_aula_virtual/src/adapters/driven/persistence/generation/PrismaGenerationRepositoryImpl.ts`
    - Implementar `listGenerations`: consulta `Cohort` con conteos de grupos y offerings únicos
    - Implementar `createGeneration`: INSERT en `cohorts` + grupo `__template__` + offerings iniciales si hay `courseIds`
    - Implementar `getGenerationDetail`: cohort + cursos únicos (via offerings de todos sus grupos) + paralelos con `studentCount`
    - Implementar `updateGeneration`: PATCH solo campos enviados
    - Implementar `addCourses`: UPSERT offerings en grupo template, deduplicando por `course_id`
    - Implementar `createParallel`: INSERT `Group` + copiar offerings del template al nuevo grupo
    - Implementar `getParallelStudents`: SELECT enrollments con datos de usuario
    - Implementar `enrollStudents`: UPSERT enrollments por cada offering del paralelo × cada userId
    - _Requirements: 2.2, 3.2, 3.3, 4.2, 6.2, 6.5, 7.2, 7.3, 8.1, 8.2, 11.4_

  - [ ]* 1.3 Escribir property test: Unicidad de nombre de generación (Property 1)
    - **Property 1: Unicidad de nombre de generación**
    - **Validates: Requirements 2.6**
    - Usar `fast-check`: crear dos generaciones con el mismo nombre, verificar que la segunda retorna 409

  - [ ]* 1.4 Escribir property test: Validación de rango de fechas (Property 2)
    - **Property 2: Validación de rango de fechas**
    - **Validates: Requirements 2.4**
    - Usar `fast-check`: generar pares donde endDate < startDate, verificar HTTP 400

  - [ ]* 1.5 Escribir property test: Idempotencia de asignación de cursos (Property 3)
    - **Property 3: Idempotencia de asignación de cursos**
    - **Validates: Requirements 3.3**
    - Usar `fast-check`: asignar mismos courseIds dos veces, verificar que offerings no se duplican

  - [ ]* 1.6 Escribir property test: Unicidad de nombre de paralelo (Property 4)
    - **Property 4: Unicidad de nombre de paralelo dentro de generación**
    - **Validates: Requirements 6.3**
    - Usar `fast-check`: crear dos paralelos con el mismo nombre en la misma generación, verificar 409

  - [ ]* 1.7 Escribir property test: Creación automática de offerings al crear paralelo (Property 5)
    - **Property 5: Creación automática de offerings al crear paralelo**
    - **Validates: Requirements 6.5**
    - Usar `fast-check`: generación con N cursos → crear paralelo → verificar exactamente N offerings

  - [ ]* 1.8 Escribir property test: Idempotencia de inscripción de estudiantes (Property 6)
    - **Property 6: Idempotencia de inscripción de estudiantes**
    - **Validates: Requirements 7.3**
    - Usar `fast-check`: inscribir mismos userIds dos veces, verificar sin duplicados en enrollments

  - [ ]* 1.9 Escribir property test: Estado vacío puro (Property 7)
    - **Property 7: Estado vacío puro — sin datos precargados**
    - **Validates: Requirements 11.4, 11.5, 11.6**
    - Usar `fast-check`: generación recién creada sin courseIds → detail.courses.length === 0 && detail.parallels.length === 0

  - [ ]* 1.10 Escribir property test: Cambio de estado no afecta inscripciones (Property 8)
    - **Property 8: Cambio de estado no afecta inscripciones**
    - **Validates: Requirements 8.2**
    - Usar `fast-check`: generación con estudiantes inscritos → cambiar a inactiva → enrollments sin cambios

- [x] 2. Registrar rutas del GenerationController en el servidor Express
  - Agregar el router de generaciones en el archivo de rutas principal del backend
  - Montar bajo `/api/admin/generations` y `/api/admin/parallels`
  - Aplicar middleware de autenticación/autorización de admin existente
  - _Requirements: 2.2, 6.2, 7.2_

- [x] 3. Checkpoint — Verificar que todos los endpoints responden correctamente
  - Asegurar que todos los tests pasen. Consultar al usuario si surgen dudas.

- [x] 4. Definir tipos TypeScript del dominio en el frontend
  - Crear archivo `clearminds-lms/src/types/generation.ts` con las interfaces del diseño:
    `Generation`, `GenerationDetail`, `CourseInGeneration`, `Parallel`, `ParallelDetail`, `EnrolledStudent`, `OfferingInParallel`
  - Crear payloads: `CreateGenerationPayload`, `UpdateGenerationPayload`, `AddCoursesPayload`, `CreateParallelPayload`, `EnrollStudentsPayload`
  - _Requirements: 1.3, 2.1, 6.1_

- [x] 5. Agregar métodos de API en `api.ts` para generaciones
  - Archivo: `clearminds-lms/src/services/api.ts` (o equivalente existente)
  - Agregar: `getGenerations`, `createGeneration`, `updateGeneration`, `getGenerationDetail`, `addCoursesToGeneration`, `createParallel`, `getParallelStudents`, `enrollStudentsInParallel`
  - Manejar errores HTTP 400, 409, 404 y retornarlos como objetos de error tipados
  - _Requirements: 1.1, 2.2, 4.2, 6.2, 7.2, 8.1_

- [x] 6. Implementar hooks personalizados del frontend
  - [x] 6.1 Crear `useGenerations` en `clearminds-lms/src/hooks/useGenerations.ts`
    - Estado: `generations`, `isLoading`, `error`
    - Acciones: `createGeneration`, `updateGeneration`, `refetch`
    - _Requirements: 1.1, 1.4, 2.5, 8.3_

  - [x] 6.2 Crear `useGenerationDetail` en `clearminds-lms/src/hooks/useGenerationDetail.ts`
    - Estado: `detail`, `isLoading`
    - Acciones: `addCourses`, `createParallel`, `refetch`
    - _Requirements: 3.4, 4.4, 6.4_

  - [x] 6.3 Crear `useParallelDetail` en `clearminds-lms/src/hooks/useParallelDetail.ts`
    - Estado: `detail`, `isLoading`
    - Acciones: `enrollStudents`, `refetch`
    - _Requirements: 7.4, 7.5_

- [x] 7. Implementar componente `GenerationsTab`
  - Archivo: `clearminds-lms/src/pages/Admin/components/GenerationsTab.tsx`
  - Usar `useGenerations` para cargar y mostrar la lista
  - Mostrar spinner mientras carga (Req. 1.4)
  - Mostrar `EmptyState` con botón "Crear generación" cuando la lista está vacía (Req. 1.2, 11.2)
  - Renderizar `GenerationCard` por cada generación
  - Incluir botón/modal para crear nueva generación con el formulario del diseño (nombre, descripción, fechas, cursos)
  - Validar en frontend que endDate >= startDate antes de enviar
  - Mostrar error inline si la API retorna 400 o 409 (Req. 11.4)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 2.4, 2.5, 2.6, 11.1, 11.2, 11.3_

  - [ ]* 7.1 Escribir unit tests para `GenerationsTab`
    - Verificar renderizado de `EmptyState` cuando `generations` está vacío
    - Verificar que el spinner aparece cuando `isLoading === true`
    - _Requirements: 1.2, 1.4_

- [x] 8. Implementar componente `GenerationCard`
  - Archivo: `clearminds-lms/src/pages/Admin/components/GenerationCard.tsx`
  - Mostrar: nombre, descripción, fechas, estado (badge activa/inactiva), conteo de cursos y paralelos
  - Botón de editar que abre modal con `UpdateGenerationPayload`
  - Al hacer click en la tarjeta, navegar al detalle de la generación
  - _Requirements: 1.3, 8.1, 8.3_

- [x] 9. Implementar componente `GenerationDetailView`
  - Archivo: `clearminds-lms/src/pages/Admin/components/GenerationDetailView.tsx`
  - Usar `useGenerationDetail` para cargar cursos y paralelos
  - Sección "Cursos": lista de `CourseInGeneration` con botón "Gestionar bloques" por curso y botón "Agregar cursos"
  - Sección "Paralelos": lista de `Parallel` con botón "Ver paralelo" y botón "Crear paralelo"
  - Mostrar `EmptyState` en cada sección cuando esté vacía (Req. 11.5, 11.6)
  - Modal "Agregar cursos": selector múltiple que muestra solo cursos no asignados (Req. 4.3)
  - Modal "Crear paralelo": campo nombre con validación
  - Botón "Volver" que regresa a `GenerationsTab`
  - _Requirements: 3.4, 4.1, 4.3, 4.4, 6.1, 6.4, 11.5, 11.6_

- [x] 10. Implementar componente `ParallelDetailView`
  - Archivo: `clearminds-lms/src/pages/Admin/components/ParallelDetailView.tsx`
  - Usar `useParallelDetail` para cargar estudiantes del paralelo
  - Mostrar lista de estudiantes inscritos con nombre, email y fecha de inscripción
  - Panel de asignación: buscador de estudiantes activos por nombre/email (Req. 7.1)
  - Marcar visualmente los estudiantes ya inscritos (Req. 7.4)
  - Botón "Asignar seleccionados" que llama a `enrollStudents`
  - Actualizar contador de estudiantes tras asignación exitosa (Req. 7.5)
  - Mostrar `EmptyState` cuando no hay estudiantes inscritos (Req. 11.2)
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 11.2_

  - [ ]* 10.1 Escribir unit tests para `ParallelDetailView`
    - Verificar que estudiantes ya inscritos aparecen marcados visualmente
    - Verificar que el botón de asignar se deshabilita durante la operación
    - _Requirements: 7.4, 11.4_

- [x] 11. Modificar `CourseManagementView` para soportar `hideParallelsTab`
  - Archivo: `clearminds-lms/src/pages/Admin/components/CourseManagementView.tsx`
  - Agregar prop `hideParallelsTab?: boolean`
  - Cuando `hideParallelsTab === true`, ocultar la sub-pestaña "Paralelos" del componente
  - _Requirements: 9.2_

- [x] 12. Integrar `GenerationsTab` en `Admin/index.tsx` y conectar la navegación
  - Reemplazar el componente que se renderiza cuando `activeTab === 'courses'` por `GenerationsTab`
  - Manejar el estado de navegación: lista → detalle de generación → detalle de paralelo / gestión de bloques
  - Pasar `hideParallelsTab={true}` a `CourseManagementView` cuando se accede desde `GenerationDetailView`
  - _Requirements: 1.1, 5.1, 9.1, 9.2_

- [x] 13. Migrar tab `blocks`: eliminar sub-pestaña "Gestión de Paralelos"
  - Localizar el componente del tab `blocks` que contiene la sub-pestaña de paralelos
  - Eliminar la sub-pestaña "Gestión de Paralelos" y su lógica asociada
  - Verificar que la gestión de bloques y temas sigue funcionando correctamente
  - _Requirements: 9.1, 9.3_

- [x] 14. Checkpoint final — Asegurar que todos los tests pasan
  - Asegurar que todos los tests pasan. Consultar al usuario si surgen dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los property tests usan `fast-check` con mínimo 100 iteraciones por propiedad
- El grupo `__template__` es un detalle de implementación interno; nunca se expone en las respuestas de la API
- Los checkpoints validan el progreso incremental antes de continuar con la siguiente fase

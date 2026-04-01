# Documento de Requisitos

## Introducción

Este documento describe el rediseño del tab **"Gestión de Cursos"** en el panel de administración del LMS Clearminds. El nuevo flujo introduce el concepto de **Generaciones** como unidad organizativa central: un admin crea una Generación (ej. "Generación 1"), le asigna cursos, organiza esos cursos en bloques con temas, crea paralelos (grupos de estudiantes) dentro de la generación y asigna estudiantes a esos paralelos.

La lógica actual de "Gestión de Paralelos" ubicada en el tab `blocks` queda obsoleta y será reemplazada por este nuevo flujo centralizado.

---

## Glosario

- **Generation (Generación)**: Unidad organizativa de alto nivel que agrupa un conjunto de cursos y paralelos para una cohorte de estudiantes. Mapea al modelo `Cohort` del schema de Prisma.
- **Course (Curso)**: Unidad de contenido educativo existente en el sistema. Modelo `Course` de Prisma.
- **Block (Bloque)**: Agrupación de temas dentro de un curso, con metas de progreso y reglas de tutoría. Modelo `Block` de Prisma.
- **Topic (Tema)**: Unidad de contenido dentro de un bloque. Modelo `Topic` de Prisma.
- **Parallel (Paralelo)**: Grupo de estudiantes asignado a una generación. Mapea al modelo `Group` de Prisma con relación a `Cohort`.
- **Offering (Oferta Académica)**: Instancia de un curso asignado a un paralelo. Modelo `AcademicOffering` de Prisma.
- **Enrollment (Inscripción)**: Registro de un estudiante en una oferta académica. Modelo `Enrollment` de Prisma.
- **Admin_Panel**: El panel de administración del LMS Clearminds (frontend React + TypeScript).
- **Generation_API**: El conjunto de endpoints REST del backend (Node.js + Express + Prisma) que gestionan generaciones, paralelos y asignaciones.
- **Course_Management_Tab**: El tab "Gestión de Cursos" en el sidebar del Admin_Panel.

---

## Requisitos

### Requisito 1: Vista principal del tab "Gestión de Cursos"

**User Story:** Como administrador, quiero ver una lista de todas las generaciones al ingresar al tab "Gestión de Cursos", para tener una visión general del estado académico de la plataforma.

#### Criterios de Aceptación

1. WHEN el Admin_Panel carga el Course_Management_Tab, THE Admin_Panel SHALL mostrar la lista de generaciones existentes obtenidas desde la Generation_API.
2. WHEN no existen generaciones registradas, THE Admin_Panel SHALL mostrar un estado vacío con un mensaje descriptivo y un botón para crear la primera generación.
3. THE Admin_Panel SHALL mostrar para cada generación: nombre, descripción, fechas de inicio y fin, estado (activa/inactiva), número de cursos asignados y número de paralelos.
4. WHEN el Admin_Panel está cargando los datos de generaciones, THE Admin_Panel SHALL mostrar un indicador de carga visible.

---

### Requisito 2: Crear una Generación

**User Story:** Como administrador, quiero crear una nueva generación con sus datos básicos y cursos iniciales, para organizar una nueva cohorte de estudiantes.

#### Criterios de Aceptación

1. WHEN el administrador activa el formulario de creación, THE Admin_Panel SHALL presentar campos para: nombre (requerido), descripción (opcional), fecha de inicio (requerida), fecha de fin (requerida) y selección múltiple de cursos.
2. WHEN el administrador envía el formulario con todos los campos requeridos válidos, THE Generation_API SHALL crear la generación en la base de datos y devolver el objeto creado con su identificador único.
3. IF el administrador envía el formulario sin el campo nombre, THEN THE Generation_API SHALL retornar un error HTTP 400 con un mensaje descriptivo del campo faltante.
4. IF el administrador envía una fecha de fin anterior a la fecha de inicio, THEN THE Generation_API SHALL retornar un error HTTP 400 indicando que el rango de fechas es inválido.
5. WHEN la generación es creada exitosamente, THE Admin_Panel SHALL actualizar la lista de generaciones sin requerir recarga completa de la página.
6. THE Generation_API SHALL garantizar que el nombre de una generación sea único dentro del sistema; IF se intenta crear una generación con un nombre duplicado, THEN THE Generation_API SHALL retornar un error HTTP 409.

---

### Requisito 3: Asignar cursos a una Generación

**User Story:** Como administrador, quiero seleccionar los cursos que formarán parte de una generación al crearla o editarla, para definir el plan académico de esa cohorte.

#### Criterios de Aceptación

1. WHEN el administrador abre el formulario de creación o edición de una generación, THE Admin_Panel SHALL mostrar la lista completa de cursos activos disponibles en el sistema para su selección.
2. WHEN el administrador selecciona uno o más cursos y guarda la generación, THE Generation_API SHALL crear una `AcademicOffering` por cada curso seleccionado vinculada a la generación.
3. WHEN el administrador asigna el mismo curso a una generación más de una vez, THE Generation_API SHALL ignorar la asignación duplicada y mantener una única relación curso-generación.
4. THE Admin_Panel SHALL mostrar visualmente qué cursos ya están asignados a la generación al editar una generación existente.

---

### Requisito 4: Agregar cursos adicionales a una Generación existente

**User Story:** Como administrador, quiero agregar cursos adicionales a una generación ya creada, para ampliar el plan académico de una cohorte en curso.

#### Criterios de Aceptación

1. WHEN el administrador accede al detalle de una generación existente, THE Admin_Panel SHALL mostrar una opción para agregar cursos adicionales.
2. WHEN el administrador selecciona cursos adicionales y confirma, THE Generation_API SHALL crear las `AcademicOffering` correspondientes para los cursos nuevos sin afectar las ofertas existentes.
3. THE Admin_Panel SHALL mostrar únicamente los cursos que aún no están asignados a la generación en el selector de cursos adicionales.
4. WHEN la asignación de cursos adicionales es exitosa, THE Admin_Panel SHALL reflejar los nuevos cursos en la vista de detalle de la generación de forma inmediata.

---

### Requisito 5: Gestionar bloques y temas dentro de un curso de la Generación

**User Story:** Como administrador, quiero organizar el contenido de cada curso asignado a una generación en bloques con temas, para estructurar el avance académico de los estudiantes.

#### Criterios de Aceptación

1. WHEN el administrador selecciona un curso dentro de una generación, THE Admin_Panel SHALL mostrar la vista de gestión de bloques y temas de ese curso.
2. WHEN el administrador crea un bloque con nombre, orden, meta de progreso, nota mínima de aprobación y temas asociados, THE Generation_API SHALL persistir el bloque vinculado al curso correspondiente.
3. WHEN el administrador edita un bloque existente, THE Generation_API SHALL actualizar únicamente los campos modificados sin afectar otros bloques del mismo curso.
4. WHEN el administrador elimina un bloque, THE Generation_API SHALL desvincular los temas asociados antes de eliminar el bloque, y THE Admin_Panel SHALL actualizar la lista de bloques de forma inmediata.
5. IF el administrador intenta crear un bloque sin nombre, THEN THE Generation_API SHALL retornar un error HTTP 400.

---

### Requisito 6: Crear Paralelos dentro de una Generación

**User Story:** Como administrador, quiero crear paralelos (grupos de estudiantes) dentro de una generación, para dividir la cohorte en grupos de trabajo independientes.

#### Criterios de Aceptación

1. WHEN el administrador accede al detalle de una generación, THE Admin_Panel SHALL mostrar la lista de paralelos existentes y una opción para crear un nuevo paralelo.
2. WHEN el administrador crea un paralelo con nombre dentro de una generación, THE Generation_API SHALL crear un `Group` vinculado al `Cohort` correspondiente a esa generación.
3. THE Generation_API SHALL garantizar que el nombre de un paralelo sea único dentro de la misma generación; IF se intenta crear un paralelo con nombre duplicado en la misma generación, THEN THE Generation_API SHALL retornar un error HTTP 409.
4. WHEN el paralelo es creado exitosamente, THE Admin_Panel SHALL mostrar el nuevo paralelo en la lista de paralelos de la generación sin requerir recarga de página.
5. WHEN se crea un paralelo en una generación que tiene cursos asignados, THE Generation_API SHALL crear automáticamente las `AcademicOffering` correspondientes para ese paralelo con todos los cursos de la generación.

---

### Requisito 7: Asignar estudiantes a una Generación o Paralelo

**User Story:** Como administrador, quiero asignar estudiantes a una generación o a un paralelo específico, para matricularlos en el plan académico correspondiente.

#### Criterios de Aceptación

1. WHEN el administrador accede al detalle de un paralelo, THE Admin_Panel SHALL mostrar la lista de estudiantes activos del sistema con opción de búsqueda por nombre o email.
2. WHEN el administrador selecciona uno o más estudiantes y los asigna a un paralelo, THE Generation_API SHALL crear un `Enrollment` por cada combinación estudiante-`AcademicOffering` del paralelo.
3. WHEN un estudiante ya está inscrito en una oferta académica del paralelo, THE Generation_API SHALL omitir esa inscripción duplicada sin retornar error, procesando las demás inscripciones válidas.
4. THE Admin_Panel SHALL mostrar visualmente qué estudiantes ya están asignados al paralelo para evitar asignaciones redundantes.
5. WHEN la asignación de estudiantes es exitosa, THE Admin_Panel SHALL actualizar el contador de estudiantes del paralelo de forma inmediata.

---

### Requisito 8: Editar y gestionar el estado de una Generación

**User Story:** Como administrador, quiero editar los datos de una generación existente y cambiar su estado, para mantener la información académica actualizada.

#### Criterios de Aceptación

1. WHEN el administrador edita una generación y guarda los cambios, THE Generation_API SHALL actualizar únicamente los campos modificados y retornar el objeto actualizado.
2. WHEN el administrador cambia el estado de una generación a "inactiva", THE Generation_API SHALL actualizar el estado de la generación sin afectar las inscripciones existentes de los estudiantes.
3. THE Admin_Panel SHALL reflejar el estado actualizado de la generación en la lista principal de forma inmediata tras la confirmación del servidor.

---

### Requisito 9: Migración del flujo de "Gestión de Paralelos" del tab blocks

**User Story:** Como administrador, quiero que la gestión de paralelos esté centralizada en el tab "Gestión de Cursos" bajo el concepto de Generaciones, para tener un flujo unificado y coherente.

#### Criterios de Aceptación

1. THE Admin_Panel SHALL eliminar la sub-pestaña "Gestión de Paralelos" del tab `blocks`, consolidando toda la gestión de paralelos dentro del Course_Management_Tab.
2. THE Admin_Panel SHALL mantener la funcionalidad de gestión de bloques y temas accesible desde el detalle de cada curso dentro de una generación.
3. WHEN el administrador navega al tab `blocks`, THE Admin_Panel SHALL mostrar únicamente la gestión de contenido de cursos (bloques y temas), sin la opción de crear paralelos independientes.

---

### Requisito 11: Sin datos precargados (empty state puro)

**User Story:** Como administrador, quiero que todas las secciones del sistema muestren únicamente datos reales creados por mí, para evitar confusión con información ficticia o de ejemplo.

#### Criterios de Aceptación

1. THE Admin_Panel SHALL NOT mostrar datos de ejemplo, placeholders con contenido ficticio, ni valores quemados en ninguna lista, tarjeta o tabla de la sección Course_Management_Tab.
2. WHEN una lista de generaciones, cursos, bloques, paralelos o estudiantes está vacía, THE Admin_Panel SHALL mostrar únicamente un estado vacío con un ícono, un mensaje descriptivo y un botón de acción para crear el primer elemento.
3. THE Admin_Panel SHALL NOT pre-seleccionar cursos, bloques ni paralelos en ningún formulario; todos los campos de selección múltiple deben iniciar vacíos.
4. THE Generation_API SHALL NOT insertar datos de ejemplo ni registros por defecto al crear una generación; el objeto creado debe contener únicamente los datos enviados por el administrador.
5. WHEN el administrador abre el detalle de una generación recién creada sin cursos asignados, THE Admin_Panel SHALL mostrar la sección de cursos completamente vacía, sin sugerir ni mostrar cursos de ejemplo.
6. WHEN el administrador abre la sección de paralelos de una generación sin paralelos creados, THE Admin_Panel SHALL mostrar la lista de paralelos vacía, sin mostrar paralelos de ejemplo ni datos ficticios.


**User Story:** Como administrador, quiero recibir retroalimentación clara cuando ocurren errores o el sistema está procesando una operación, para entender el estado de mis acciones.

#### Criterios de Aceptación

1. IF una llamada a la Generation_API falla por error de red o error del servidor (HTTP 5xx), THEN THE Admin_Panel SHALL mostrar un mensaje de error descriptivo al administrador sin colapsar la interfaz.
2. WHILE una operación de creación, edición o asignación está en proceso, THE Admin_Panel SHALL deshabilitar el botón de confirmación y mostrar un indicador de carga.
3. WHEN una operación es completada exitosamente, THE Admin_Panel SHALL mostrar una notificación de éxito al administrador.
4. IF la Generation_API retorna un error de validación (HTTP 400 o 409), THEN THE Admin_Panel SHALL mostrar el mensaje de error específico retornado por el servidor junto al campo correspondiente cuando sea posible.

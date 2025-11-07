# Configuración del Dashboard de Administración

Este documento explica cómo configurar y usar el panel de administración para gestionar las postulaciones de estudiantes.

## 📋 Tablas Necesarias

Antes de usar el dashboard de administración, necesitas ejecutar el script SQL para crear las tablas necesarias.

### Ejecutar el Script SQL

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"
   - Haz clic en "New query" o "Nueva consulta"

3. **Ejecuta el Script de Migración**
   - Abre el archivo `migration_admin_tables.sql` en este proyecto
   - Copia todo el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" o presiona `Ctrl + Enter` (Windows/Linux) o `Cmd + Enter` (Mac)

4. **Verifica las Tablas Creadas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver tres nuevas tablas:
     - `administradores` (vacía inicialmente - aquí se agregan los usuarios administradores)
     - `estados_postulacion` (con 3 registros: Pendiente, Aceptado, Rechazado)
     - `estudiantes_postulaciones` (vacía inicialmente)

## 👤 Crear una Cuenta de Administrador

Para crear una cuenta de administrador, necesitas:

1. **Registrar un usuario normalmente** (puedes usar el formulario de registro)
2. **Obtener el UUID del usuario** ejecutando este SQL:

```sql
-- Obtener el UUID del usuario por email
SELECT id, email FROM auth.users WHERE email = 'email@ejemplo.com';
```

3. **Agregar el usuario a la tabla de administradores** ejecutando este SQL:

```sql
-- Reemplaza 'UUID_DEL_USUARIO' con el UUID obtenido en el paso anterior
INSERT INTO administradores (user_id) 
VALUES ('UUID_DEL_USUARIO');
```

**Ejemplo completo:**

```sql
-- Paso 1: Obtener el UUID
SELECT id, email FROM auth.users WHERE email = 'admin@uleam.edu.ec';

-- Paso 2: Agregar como administrador (usa el UUID del paso 1)
INSERT INTO administradores (user_id) 
VALUES ('123e4567-e89b-12d3-a456-426614174000');
```

**Nota:** El rol de administrador ahora se gestiona a través de la tabla `administradores` en lugar de `user_metadata`. Esto permite un mejor control y gestión de los administradores.

## 🔐 Acceso al Dashboard

Una vez que hayas agregado un usuario a la tabla `administradores`:

1. Inicia sesión con esa cuenta
2. Serás redirigido automáticamente al `/admin-dashboard`
3. Podrás ver todas las postulaciones de estudiantes

## 📊 Funcionalidades del Dashboard

### Estadísticas
- **Total Postulaciones**: Número total de ofertas de pasantías
- **Postulaciones de Estudiantes**: Número total de postulaciones realizadas por estudiantes
- **Pendientes**: Postulaciones que están en estado "Pendiente"
- **Aceptadas**: Postulaciones que han sido aceptadas

### Filtros
- **Filtrar por Estado**: Puedes filtrar las postulaciones por estado (Pendiente, Aceptado, Rechazado)
- **Filtrar por Oferta**: Puedes filtrar por una oferta específica de pasantía

### Gestión de Estados
- Puedes cambiar el estado de cualquier postulación de estudiante
- Los estados disponibles son:
  - **Pendiente**: Estado inicial cuando un estudiante postula
  - **Aceptado**: El estudiante ha sido aceptado para la pasantía
  - **Rechazado**: El estudiante no ha sido aceptado

## 🗄️ Estructura de las Tablas

### Tabla `administradores`
- `id` (UUID): Identificador único
- `user_id` (UUID): ID del usuario (debe ser único, sin relación con otras tablas)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización
- **Nota:** Esta es una tabla independiente sin relaciones con otras tablas

### Tabla `estados_postulacion`
- `id` (UUID): Identificador único
- `nombre` (VARCHAR): Nombre del estado (Pendiente, Aceptado, Rechazado)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### Tabla `estudiantes_postulaciones`
- `id` (UUID): Identificador único
- `student_id` (UUID): Referencia al ID del estudiante (usuario autenticado)
- `postulacion_id` (UUID): Referencia a la tabla `postulaciones`
- `estado_id` (UUID): Referencia a la tabla `estados_postulacion`
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización
- **Restricción única**: Un estudiante no puede postular dos veces a la misma oferta

## 🔒 Seguridad (Row Level Security)

Las políticas de seguridad están configuradas para que:

- **Estudiantes**: Solo pueden ver y crear sus propias postulaciones (siempre con estado "Pendiente")
- **Administradores**: Pueden ver todas las postulaciones y cambiar el estado de cualquier postulación
- **Estados**: Son de lectura pública para todos los usuarios autenticados

## 📝 Notas Importantes

- Solo los usuarios registrados en la tabla `administradores` pueden acceder al dashboard de administración
- Los estudiantes solo pueden crear postulaciones con estado "Pendiente"
- Solo los administradores pueden cambiar el estado de las postulaciones
- Un estudiante no puede postular dos veces a la misma oferta (restricción única en la base de datos)
- El rol de administrador se gestiona a través de la tabla `administradores`, no a través de `user_metadata`

## 🚀 Próximos Pasos

1. Ejecuta el script SQL `migration_admin_tables.sql`
2. Crea una cuenta de administrador
3. Accede al dashboard de administración
4. Comienza a gestionar las postulaciones de estudiantes


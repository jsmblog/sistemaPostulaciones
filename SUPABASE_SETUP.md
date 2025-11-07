# Configuración de Tablas en Supabase

Este documento explica cómo configurar las tablas necesarias para el sistema de postulaciones de pasantías.

## Pasos para Configurar

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Ejecuta el Script SQL**
   - Abre el archivo `supabase_tables.sql` en este proyecto
   - Copia todo el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" o presiona `Ctrl + Enter`

4. **Verifica las Tablas Creadas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver dos nuevas tablas:
     - `modalidades` (con 3 registros: Virtual, Presencial, Semipresencial)
     - `postulaciones` (vacía inicialmente)

## Estructura de las Tablas

### Tabla `modalidades`
- `id` (UUID): Identificador único
- `nombre` (VARCHAR): Nombre de la modalidad (Virtual, Presencial, Semipresencial)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### Tabla `postulaciones`
- `id` (UUID): Identificador único
- `company_id` (UUID): Referencia al ID de la empresa (usuario autenticado)
- `area` (VARCHAR): Área de la pasantía
- `duracion` (VARCHAR): Duración de la pasantía
- `modalidad_id` (UUID): Referencia a la tabla `modalidades`
- `requisitos` (TEXT): Requisitos de la pasantía
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

## Seguridad (Row Level Security)

Las políticas de seguridad están configuradas para que:
- Las empresas solo puedan ver, crear, actualizar y eliminar sus propias postulaciones
- Las modalidades son de lectura pública para todos los usuarios autenticados

## Notas Importantes

- Asegúrate de que el usuario tenga el rol correcto (`company`) en `user_metadata.rol`
- Las modalidades se crean automáticamente si no existen
- El sistema creará las modalidades por defecto si la tabla está vacía


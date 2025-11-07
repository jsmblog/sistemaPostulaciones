# Instrucciones para Ejecutar las Migraciones

Hay dos formas de ejecutar las migraciones de las tablas en Supabase:

## Opción 1: Ejecutar SQL Manualmente (Recomendado)

Esta es la forma más directa y recomendada:

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"
   - Haz clic en "New query" o "Nueva consulta"

3. **Copia y pega el script SQL**
   - Abre el archivo `supabase_tables.sql` en este proyecto
   - Selecciona todo el contenido (Ctrl+A)
   - Copia el contenido (Ctrl+C)
   - Pégalo en el SQL Editor de Supabase (Ctrl+V)

4. **Ejecuta el script**
   - Haz clic en el botón "Run" o presiona `Ctrl + Enter` (Windows/Linux) o `Cmd + Enter` (Mac)
   - Espera a que se complete la ejecución

5. **Verifica las tablas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver dos nuevas tablas:
     - `modalidades` (con 3 registros: Virtual, Presencial, Semipresencial)
     - `postulaciones` (vacía inicialmente)

## Opción 2: Usar el Script de Node.js (Avanzado)

Si prefieres automatizar el proceso, puedes usar el script `migrate.js`:

### Requisitos previos:
- Node.js instalado
- Service Role Key de Supabase (no la anon key)

### Pasos:

1. **Obtén tu Service Role Key**
   - En Supabase, ve a Settings > API
   - Copia el "service_role" key (⚠️ NO uses la anon key)

2. **Configura las variables de entorno**
   ```bash
   # Windows (PowerShell)
   $env:VITE_SUPABASE_URL="tu_url_de_supabase"
   $env:VITE_SUPABASE_KEY="tu_service_role_key"

   # Windows (CMD)
   set VITE_SUPABASE_URL=tu_url_de_supabase
   set VITE_SUPABASE_KEY=tu_service_role_key

   # Linux/Mac
   export VITE_SUPABASE_URL="tu_url_de_supabase"
   export VITE_SUPABASE_KEY="tu_service_role_key"
   ```

3. **Ejecuta el script**
   ```bash
   node migrate.js
   ```

**Nota:** El script de Node.js requiere que Supabase tenga habilitada la función `exec_sql`, que puede no estar disponible por defecto. Por eso, la **Opción 1 (SQL Manual) es la más recomendada**.

## Verificación

Después de ejecutar las migraciones, verifica que todo esté correcto:

1. **Verifica las tablas:**
   ```sql
   SELECT * FROM modalidades;
   SELECT COUNT(*) FROM postulaciones;
   ```

2. **Verifica las políticas de seguridad:**
   - Ve a Authentication > Policies en Supabase
   - Deberías ver las políticas creadas para `modalidades` y `postulaciones`

3. **Prueba la aplicación:**
   - Inicia sesión como empresa
   - Intenta crear una nueva postulación
   - Verifica que se guarde correctamente

## Solución de Problemas

### Error: "relation already exists"
- Esto significa que las tablas ya existen. El script está diseñado para manejar esto, así que puedes ejecutarlo de nuevo sin problemas.

### Error: "permission denied"
- Asegúrate de estar usando el SQL Editor con permisos de administrador
- Verifica que tu usuario tenga los permisos necesarios

### Error: "policy already exists"
- El script elimina las políticas existentes antes de crearlas, así que esto no debería ocurrir. Si ocurre, puedes eliminarlas manualmente y ejecutar el script de nuevo.

## Estructura de las Tablas Creadas

### Tabla `modalidades`
- `id` (UUID): Identificador único
- `nombre` (VARCHAR): Nombre de la modalidad
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### Tabla `postulaciones`
- `id` (UUID): Identificador único
- `company_id` (UUID): Referencia al ID de la empresa
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


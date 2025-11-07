# Migración: Agregar Campo Localidad

Este documento explica cómo agregar el campo `localidad` a la tabla `postulaciones` en Supabase.

## 📋 Descripción

Se ha agregado un nuevo campo `localidad` a la tabla `postulaciones` para almacenar la ubicación donde se desarrolla cada oferta de pasantía.

## 🚀 Cómo Ejecutar la Migración

### Opción 1: SQL Editor de Supabase (Recomendado)

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"
   - Haz clic en "New query" o "Nueva consulta"

3. **Ejecuta el Script de Migración**
   - Abre el archivo `migration_add_localidad.sql` en este proyecto
   - Copia todo el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" o presiona `Ctrl + Enter` (Windows/Linux) o `Cmd + Enter` (Mac)

4. **Verifica la Migración**
   - Ve a "Table Editor" en el menú lateral
   - Selecciona la tabla `postulaciones`
   - Verifica que el campo `localidad` aparezca en la lista de columnas

### Opción 2: Comando SQL Directo

Si prefieres ejecutar el comando directamente, copia y pega esto en el SQL Editor:

```sql
-- Agregar el campo localidad a la tabla postulaciones
ALTER TABLE postulaciones 
ADD COLUMN IF NOT EXISTS localidad VARCHAR(255) NOT NULL DEFAULT 'No especificada';
```

## ✅ Verificación

Después de ejecutar la migración, verifica que todo esté correcto:

1. **Verifica que el campo existe:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'postulaciones' AND column_name = 'localidad';
   ```

2. **Verifica los registros existentes:**
   ```sql
   SELECT id, area, localidad FROM postulaciones LIMIT 5;
   ```

3. **Prueba la aplicación:**
   - Inicia sesión como empresa
   - Crea una nueva postulación
   - Verifica que el campo "Localidad" aparezca en el formulario
   - Completa el campo y guarda
   - Verifica que se muestre en la tarjeta de la postulación

## 📝 Cambios Realizados

### Base de Datos
- ✅ Campo `localidad` agregado a la tabla `postulaciones`
- ✅ Tipo: `VARCHAR(255)`
- ✅ Restricción: `NOT NULL`
- ✅ Valor por defecto: `'No especificada'` (para registros existentes)

### Código Frontend
- ✅ Campo `localidad` agregado al estado `formData` en `CompanyDashboard.jsx`
- ✅ Campo de input agregado al formulario
- ✅ Validación actualizada para incluir `localidad`
- ✅ Campo incluido en las operaciones de INSERT y UPDATE
- ✅ Campo mostrado en las tarjetas de postulaciones
- ✅ Campo incluido en la función de edición

## ⚠️ Notas Importantes

- Si ya tienes registros en la tabla `postulaciones`, estos se actualizarán automáticamente con el valor por defecto `'No especificada'`
- Puedes actualizar manualmente los registros existentes después de la migración si lo deseas
- El campo es obligatorio (`NOT NULL`), por lo que todas las nuevas postulaciones deben incluir una localidad

## 🔄 Actualizar Registros Existentes (Opcional)

Si quieres actualizar los registros existentes con valores específicos, puedes ejecutar:

```sql
-- Ejemplo: Actualizar todas las postulaciones con una localidad específica
UPDATE postulaciones 
SET localidad = 'Manta' 
WHERE localidad = 'No especificada' AND area LIKE '%Software%';
```

## 📚 Archivos Modificados

1. `supabase_tables.sql` - Script inicial actualizado con el campo `localidad`
2. `migration_add_localidad.sql` - Script de migración para agregar el campo
3. `src/pages/CompanyDashboard.jsx` - Componente actualizado con el nuevo campo


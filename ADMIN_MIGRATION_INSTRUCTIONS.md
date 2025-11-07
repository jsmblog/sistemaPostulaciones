# Instrucciones de Migración: Tablas de Administración

Este documento explica cómo ejecutar la migración para crear las tablas necesarias para el dashboard de administración.

## 🚀 Ejecución Rápida

Ejecuta el siguiente comando SQL en el SQL Editor de Supabase:

```sql
-- Ver el contenido completo del archivo migration_admin_tables.sql
```

O copia y pega el contenido completo del archivo `migration_admin_tables.sql` en el SQL Editor.

## 📋 Qué Crea el Script

El script crea:

1. **Tabla `administradores`**
   - Almacena los usuarios que tienen permisos de administrador
   - Tabla independiente sin relaciones con otras tablas
   - Almacena el `user_id` como UUID sin foreign key constraint
   - Permite gestionar administradores de forma completamente independiente

2. **Tabla `estados_postulacion`**
   - Almacena los estados posibles: Pendiente, Aceptado, Rechazado
   - Se insertan automáticamente los 3 estados por defecto

3. **Tabla `estudiantes_postulaciones`**
   - Tabla intermedia entre estudiantes y postulaciones
   - Registra qué estudiante postuló a qué oferta
   - Incluye el estado de la postulación
   - Tiene restricción única para evitar postulaciones duplicadas

4. **Índices**
   - Índices para mejorar el rendimiento de las consultas

5. **Políticas de Seguridad (RLS)**
   - Administradores pueden ver su propio registro en la tabla `administradores`
   - Estudiantes solo pueden ver/crear sus propias postulaciones
   - Administradores pueden ver y actualizar todas las postulaciones (verificando la tabla `administradores`)

6. **Triggers**
   - Actualización automática del campo `updated_at` en todas las tablas

## ✅ Verificación

Después de ejecutar el script, verifica que todo esté correcto:

```sql
-- Verificar que la tabla administradores existe
SELECT * FROM administradores;

-- Verificar que los estados se crearon
SELECT * FROM estados_postulacion;

-- Verificar que la tabla estudiantes_postulaciones existe
SELECT COUNT(*) FROM estudiantes_postulaciones;

-- Verificar las políticas de seguridad
SELECT * FROM pg_policies WHERE tablename IN ('administradores', 'estudiantes_postulaciones');
```

## 🔧 Comando SQL Completo

Si prefieres ejecutar el comando directamente, aquí está el script completo:

```sql
-- Ver el archivo migration_admin_tables.sql para el script completo
```

## ⚠️ Notas Importantes

- El script es idempotente (puedes ejecutarlo múltiples veces sin problemas)
- Si las tablas ya existen, el script no las eliminará ni modificará
- Los estados se insertan automáticamente si no existen
- Las políticas de seguridad se eliminan y recrean para evitar conflictos

## 🐛 Solución de Problemas

### Error: "relation already exists"
- Esto es normal si las tablas ya existen. El script usa `IF NOT EXISTS` para evitar este error.

### Error: "policy already exists"
- El script elimina las políticas existentes antes de crearlas, así que esto no debería ocurrir.

### Error: "permission denied"
- Asegúrate de estar usando el SQL Editor con permisos de administrador
- Verifica que tu usuario tenga los permisos necesarios en Supabase


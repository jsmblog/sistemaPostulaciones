-- =====================================================
-- Migración: Agregar campo localidad a la tabla postulaciones
-- Ejecuta este script en el SQL Editor de Supabase
-- =====================================================

-- Agregar el campo localidad a la tabla postulaciones
ALTER TABLE postulaciones 
ADD COLUMN IF NOT EXISTS localidad VARCHAR(255) NOT NULL DEFAULT 'No especificada';

-- Actualizar registros existentes si es necesario (opcional)
-- Si quieres que los registros existentes tengan un valor específico, descomenta la siguiente línea:
-- UPDATE postulaciones SET localidad = 'No especificada' WHERE localidad IS NULL OR localidad = '';

-- =====================================================
-- Verificación: Verifica que el campo se agregó correctamente
-- =====================================================
-- Ejecuta esta consulta para verificar:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'postulaciones' AND column_name = 'localidad';
-- =====================================================


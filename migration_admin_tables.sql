-- =====================================================
-- Migración: Tablas para Administración y Postulaciones de Estudiantes
-- Ejecuta este script completo en el SQL Editor de Supabase
-- =====================================================

-- Paso 1: Crear tabla de administradores (tabla independiente sin relaciones)
CREATE TABLE IF NOT EXISTS administradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
);

-- Paso 2: Crear tabla de estados de postulación
CREATE TABLE IF NOT EXISTS estados_postulacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear índice para administradores
CREATE INDEX IF NOT EXISTS idx_administradores_user_id ON administradores(user_id);

-- Paso 4: Insertar estados por defecto (si no existen)
INSERT INTO estados_postulacion (nombre) VALUES
  ('Pendiente'),
  ('Aceptado'),
  ('Rechazado')
ON CONFLICT (nombre) DO NOTHING;

-- Paso 5: Crear tabla intermedia entre estudiantes y postulaciones
CREATE TABLE IF NOT EXISTS estudiantes_postulaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  postulacion_id UUID NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  estado_id UUID NOT NULL REFERENCES estados_postulacion(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Evitar que un estudiante postule dos veces a la misma oferta
  UNIQUE(student_id, postulacion_id)
);

-- Paso 6: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_estudiantes_postulaciones_student_id ON estudiantes_postulaciones(student_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_postulaciones_postulacion_id ON estudiantes_postulaciones(postulacion_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_postulaciones_estado_id ON estudiantes_postulaciones(estado_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_postulaciones_created_at ON estudiantes_postulaciones(created_at DESC);

-- Paso 7: Habilitar Row Level Security (RLS)
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_postulacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_postulaciones ENABLE ROW LEVEL SECURITY;

-- Paso 8: Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Administradores pueden ver su propio registro" ON administradores;
DROP POLICY IF EXISTS "Estados son públicos para lectura" ON estados_postulacion;
DROP POLICY IF EXISTS "Estudiantes pueden ver sus propias postulaciones" ON estudiantes_postulaciones;
DROP POLICY IF EXISTS "Estudiantes pueden crear sus propias postulaciones" ON estudiantes_postulaciones;
DROP POLICY IF EXISTS "Administradores pueden ver todas las postulaciones" ON estudiantes_postulaciones;
DROP POLICY IF EXISTS "Administradores pueden actualizar todas las postulaciones" ON estudiantes_postulaciones;

-- Paso 9: Políticas de seguridad para administradores
-- Los administradores pueden ver su propio registro
CREATE POLICY "Administradores pueden ver su propio registro"
  ON administradores FOR SELECT
  USING (auth.uid() = user_id);

-- Paso 10: Políticas de seguridad para estados_postulacion (lectura pública)
CREATE POLICY "Estados son públicos para lectura"
  ON estados_postulacion FOR SELECT
  USING (true);

-- Paso 11: Políticas de seguridad para estudiantes_postulaciones
-- Los estudiantes pueden ver sus propias postulaciones
CREATE POLICY "Estudiantes pueden ver sus propias postulaciones"
  ON estudiantes_postulaciones FOR SELECT
  USING (auth.uid() = student_id);

-- Los estudiantes pueden crear sus propias postulaciones (solo con estado pendiente)
CREATE POLICY "Estudiantes pueden crear sus propias postulaciones"
  ON estudiantes_postulaciones FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    estado_id = (SELECT id FROM estados_postulacion WHERE nombre = 'Pendiente' LIMIT 1)
  );

-- Los administradores pueden ver todas las postulaciones
CREATE POLICY "Administradores pueden ver todas las postulaciones"
  ON estudiantes_postulaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM administradores 
      WHERE administradores.user_id = auth.uid()
    )
  );

-- Los administradores pueden actualizar todas las postulaciones (cambiar estado)
CREATE POLICY "Administradores pueden actualizar todas las postulaciones"
  ON estudiantes_postulaciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM administradores 
      WHERE administradores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM administradores 
      WHERE administradores.user_id = auth.uid()
    )
  );

-- Paso 12: Función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 13: Eliminar triggers existentes si existen (para evitar duplicados)
DROP TRIGGER IF EXISTS update_administradores_updated_at ON administradores;
DROP TRIGGER IF EXISTS update_estados_postulacion_updated_at ON estados_postulacion;
DROP TRIGGER IF EXISTS update_estudiantes_postulaciones_updated_at ON estudiantes_postulaciones;

-- Paso 14: Crear triggers para actualizar updated_at
CREATE TRIGGER update_administradores_updated_at
  BEFORE UPDATE ON administradores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estados_postulacion_updated_at
  BEFORE UPDATE ON estados_postulacion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estudiantes_postulaciones_updated_at
  BEFORE UPDATE ON estudiantes_postulaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verificación: Verifica que las tablas se crearon correctamente
-- =====================================================
-- Ejecuta estas consultas para verificar:
-- SELECT * FROM administradores;
-- SELECT * FROM estados_postulacion;
-- SELECT COUNT(*) FROM estudiantes_postulaciones;
-- =====================================================

-- =====================================================
-- INSTRUCCIONES: Agregar un usuario como administrador
-- =====================================================
-- Para agregar un usuario como administrador, ejecuta:
-- INSERT INTO administradores (user_id) 
-- VALUES ('UUID_DEL_USUARIO_AQUI');
-- 
-- Para obtener el UUID de un usuario:
-- SELECT id, email FROM auth.users WHERE email = 'email@ejemplo.com';
-- 
-- NOTA: La tabla administradores es independiente y no tiene relaciones
-- con otras tablas. El user_id se almacena como UUID simple.
-- =====================================================


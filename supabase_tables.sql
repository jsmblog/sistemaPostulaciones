-- =====================================================
-- Script de Migración para Sistema de Postulaciones
-- Ejecuta este script completo en el SQL Editor de Supabase
-- =====================================================

-- Paso 1: Crear tabla de modalidades
CREATE TABLE IF NOT EXISTS modalidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 2: Insertar modalidades por defecto (si no existen)
INSERT INTO modalidades (nombre) VALUES
  ('Virtual'),
  ('Presencial'),
  ('Semipresencial')
ON CONFLICT (nombre) DO NOTHING;

-- Paso 3: Crear tabla de postulaciones
CREATE TABLE IF NOT EXISTS postulaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area VARCHAR(255) NOT NULL,
  duracion VARCHAR(100) NOT NULL,
  modalidad_id UUID NOT NULL REFERENCES modalidades(id) ON DELETE RESTRICT,
  localidad VARCHAR(255) NOT NULL,
  requisitos TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 4: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_postulaciones_company_id ON postulaciones(company_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_modalidad_id ON postulaciones(modalidad_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_created_at ON postulaciones(created_at DESC);

-- Paso 5: Habilitar Row Level Security (RLS)
ALTER TABLE modalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

-- Paso 6: Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Modalidades son públicas para lectura" ON modalidades;
DROP POLICY IF EXISTS "Las empresas pueden ver sus propias postulaciones" ON postulaciones;
DROP POLICY IF EXISTS "Las empresas pueden crear sus propias postulaciones" ON postulaciones;
DROP POLICY IF EXISTS "Las empresas pueden actualizar sus propias postulaciones" ON postulaciones;
DROP POLICY IF EXISTS "Las empresas pueden eliminar sus propias postulaciones" ON postulaciones;

-- Paso 7: Crear políticas de seguridad para modalidades (lectura pública)
CREATE POLICY "Modalidades son públicas para lectura"
  ON modalidades FOR SELECT
  USING (true);

-- Paso 8: Crear políticas de seguridad para postulaciones
-- Las empresas solo pueden ver sus propias postulaciones
CREATE POLICY "Las empresas pueden ver sus propias postulaciones"
  ON postulaciones FOR SELECT
  USING (auth.uid() = company_id);

-- Las empresas solo pueden insertar sus propias postulaciones
CREATE POLICY "Las empresas pueden crear sus propias postulaciones"
  ON postulaciones FOR INSERT
  WITH CHECK (auth.uid() = company_id);

-- Las empresas solo pueden actualizar sus propias postulaciones
CREATE POLICY "Las empresas pueden actualizar sus propias postulaciones"
  ON postulaciones FOR UPDATE
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

-- Las empresas solo pueden eliminar sus propias postulaciones
CREATE POLICY "Las empresas pueden eliminar sus propias postulaciones"
  ON postulaciones FOR DELETE
  USING (auth.uid() = company_id);

-- Paso 9: Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 10: Eliminar triggers existentes si existen (para evitar duplicados)
DROP TRIGGER IF EXISTS update_modalidades_updated_at ON modalidades;
DROP TRIGGER IF EXISTS update_postulaciones_updated_at ON postulaciones;

-- Paso 11: Crear triggers para actualizar updated_at
CREATE TRIGGER update_modalidades_updated_at
  BEFORE UPDATE ON modalidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postulaciones_updated_at
  BEFORE UPDATE ON postulaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verificación: Verifica que las tablas se crearon correctamente
-- =====================================================
-- Ejecuta estas consultas para verificar:
-- SELECT * FROM modalidades;
-- SELECT COUNT(*) FROM postulaciones;
-- =====================================================


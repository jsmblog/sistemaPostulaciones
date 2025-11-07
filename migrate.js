/**
 * Script de migración para ejecutar las tablas en Supabase
 * 
 * Este script requiere que tengas configuradas las variables de entorno:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_KEY (service_role key para poder ejecutar SQL)
 * 
 * Ejecuta: node migrate.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_KEY');
  console.log('\nPor favor, configura las variables de entorno:');
  console.log('export VITE_SUPABASE_URL="tu_url"');
  console.log('export VITE_SUPABASE_KEY="tu_service_role_key"');
  process.exit(1);
}

// Crear cliente de Supabase con service_role key para poder ejecutar SQL
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de tablas...\n');

    // Leer el archivo SQL
    const sqlFile = join(__dirname, 'supabase_tables.sql');
    const sql = readFileSync(sqlFile, 'utf-8');

    // Dividir el SQL en comandos individuales (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Ejecutando ${commands.length} comandos SQL...\n`);

    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Saltar comentarios y líneas vacías
      if (command.startsWith('--') || command.length === 0) {
        continue;
      }

      try {
        console.log(`⏳ Ejecutando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });

        if (error) {
          // Algunos errores son esperados (como "ya existe")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  Advertencia: ${error.message}`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado correctamente`);
        }
      } catch (err) {
        console.error(`❌ Error en comando ${i + 1}:`, err.message);
        // Continuar con el siguiente comando
      }
    }

    console.log('\n✅ Migración completada!');
    console.log('\n📋 Verifica las tablas en Supabase:');
    console.log('   - modalidades (debe tener 3 registros)');
    console.log('   - postulaciones (vacía inicialmente)');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
runMigration();


import { pool } from './db';

const migrateIdempotency = async () => {
  console.log('--- MIGRANDO IDEMPOTENCIA ---');
  const client = await pool.connect();

  try {
    // 1. Añadir columna client_order_id (UUID único)
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS client_order_id UUID UNIQUE;
    `);
    
    console.log('✅ Columna client_order_id añadida con restricción UNIQUE.');
    console.log('--- MIGRACIÓN COMPLETA ---');
  } catch (err) {
    console.error('❌ Error en la migración:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrateIdempotency();

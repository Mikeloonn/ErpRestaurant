import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// El Pool de conexiones es el estándar de oro en Backend.
// Mantiene conexiones "calientes" para responder en milisegundos.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  ssl: {
    rejectUnauthorized: false // Requerido para Supabase y otros servicios en la nube
  }
});

// Helper para consultas SQL paramétricas (Seguro contra SQL Injection)
export const query = (text: string, params?: any[]) => pool.query(text, params);

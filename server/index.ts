import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check: Para saber si el backend está vivo
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB connection failed' });
  }
});

/**
 * CREAR PEDIDO (Endpoint Profesional con Transacción)
 * 1. Empieza transacción (BEGIN)
 * 2. Valida stock y precios reales
 * 3. Crea el pedido
 * 4. Inserta items
 * 5. Resta stock de forma atómica
 * 6. Finaliza transacción (COMMIT)
 */
app.post('/api/orders', async (req, res) => {
  const { type, tableId, customerName, items } = req.body;
  
  const client = await pool.connect(); // Obtenemos una conexión del pool

  try {
    await client.query('BEGIN'); // --- INICIO TRANSACCIÓN ---

    // 1. Validar Stock y Calcular Total con precios REALES de la DB
    let totalCents = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const pResult = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE', // "FOR UPDATE" bloquea la fila para evitar que otro reste stock al mismo tiempo
        [item.productId]
      );
      
      const product = pResult.rows[0];
      if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Quedan: ${product.stock}`);
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalCents += itemTotal;
      
      itemsToInsert.push({
        ...item,
        price: product.price,
        name: product.name
      });
    }

    // 2. Insertar el Pedido (Orders)
    const orderInsert = await client.query(
      `INSERT INTO orders (type, table_id, customer_name, total, status) 
       VALUES ($1, $2, $3, $4, 'Abierta') RETURNING id`,
      [type, tableId || null, customerName || null, totalCents]
    );
    const orderId = orderInsert.rows[0].id;

    // 3. Insertar Items y Restar Stock (SQL Puro en el Backend)
    for (const item of itemsToInsert) {
      // Insertar Item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, notes, is_takeaway)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.productId, item.name, item.price, item.quantity, item.notes || '', item.isTakeaway || false]
      );

      // Restar Stock (Atómico)
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
      
      // Registrar en Kardex (Movimiento de Salida)
      await client.query(
        `INSERT INTO kardex_movements (product_id, type, quantity, reason, date)
         VALUES ($1, 'Salida', $2, $3, NOW())`,
        [item.productId, item.quantity, `Venta Ticket #${orderId.slice(-4)}`]
      );
    }

    // 4. Si es salón, actualizar el estado de la mesa
    if (type === 'Salon' && tableId) {
      await client.query(
        'UPDATE tables SET status = \'Ocupada\', current_order_id = $1 WHERE id = $2',
        [orderId, tableId]
      );
    }

    await client.query('COMMIT'); // --- FIN TRANSACCIÓN EXITOSA ---
    
    res.status(201).json({ id: orderId, total: totalCents, status: 'Abierta' });

  } catch (err: any) {
    await client.query('ROLLBACK'); // --- SI ALGO FALLÓ, DESHACEMOS TODO ---
    console.error("❌ Transaction Error:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release(); // Siempre liberamos la conexión al pool
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor Backend Independiente en http://localhost:${port}`);
});

import { pool } from '../db';

export const createOrderTransaction = async (orderData: any) => {
  const { type, tableId, customerName, clientOrderId, items } = orderData;
  const client = await pool.connect();

  try {
    // 1. --- IDEMPOTENCIA ---
    // Si ya existe un pedido con ese clientOrderId, lo devolvemos tal cual
    const existing = await client.query('SELECT id, total, status FROM orders WHERE client_order_id = $1', [clientOrderId]);
    if (existing.rows.length > 0) {
      console.log(`⚠️ IDEMPOTENCIA DETECTADA: Pedido ${clientOrderId} ya procesado.`);
      return { ...existing.rows[0], idempotent: true };
    }

    await client.query('BEGIN');

    let totalCents = 0;
    const itemsToInsert = [];

    // 2. Validar Stock y Calcular Total
    for (const item of items) {
      const pResult = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );
      
      const product = pResult.rows[0];
      if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Quedan: ${product.stock}`);
      }

      totalCents += Number(product.price) * item.quantity;
      itemsToInsert.push({ ...item, price: product.price, name: product.name });
    }

    // 3. Insertar Pedido con su Idempotency Key
    const orderInsert = await client.query(
      `INSERT INTO orders (type, table_id, customer_name, client_order_id, total, status) 
       VALUES ($1, $2, $3, $4, $5, 'Abierta') RETURNING id`,
      [type, tableId || null, customerName || null, clientOrderId, totalCents]
    );
    const orderId = orderInsert.rows[0].id;

    // 4. Items y Stock
    for (const item of itemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, notes, is_takeaway)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.productId, item.name, item.price, item.quantity, item.notes || '', item.isTakeaway || false]
      );

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.productId]);
      
      await client.query(
        `INSERT INTO kardex_movements (product_id, type, quantity, reason, date)
         VALUES ($1, 'Salida', $2, $3, NOW())`,
        [item.productId, item.quantity, `Venta Ticket #${orderId.slice(-4)}`]
      );
    }

    if (type === 'Salon' && tableId) {
      await client.query('UPDATE tables SET status = \'Ocupada\', current_order_id = $1 WHERE id = $2', [orderId, tableId]);
    }

    await client.query('COMMIT');
    return { id: orderId, total: totalCents, status: 'Abierta' };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

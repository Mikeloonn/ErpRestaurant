import { pool } from '../db';

export const createOrderTransaction = async (orderData: any) => {
  const { type, tableId, customerName, items } = orderData;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalCents = 0;
    const itemsToInsert = [];

    // 1. Validar Stock y Calcular Total
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

    // 2. Insertar Pedido
    const orderInsert = await client.query(
      `INSERT INTO orders (type, table_id, customer_name, total, status) 
       VALUES ($1, $2, $3, $4, 'Abierta') RETURNING id`,
      [type, tableId || null, customerName || null, totalCents]
    );
    const orderId = orderInsert.rows[0].id;

    // 3. Items y Stock
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

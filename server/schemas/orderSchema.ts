import { z } from 'zod';

export const createOrderSchema = z.object({
  type: z.enum(['Salon', 'Llevar', 'Delivery']),
  tableId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional().nullable(),
  clientOrderId: z.string().uuid("ID único de pedido obligatorio"), // EL TOKEN DE IDEMPOTENCIA
  items: z.array(z.object({
    productId: z.string().uuid("ID de producto no válido"),
    quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
    notes: z.string().optional(),
    isTakeaway: z.boolean().optional()
  })).min(1, "El pedido no puede estar vacío")
});

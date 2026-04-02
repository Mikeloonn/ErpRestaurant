import { Request, Response, NextFunction } from 'express';
import { createOrderSchema } from '../schemas/orderSchema';
import { createOrderTransaction } from '../services/orderService';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validar los datos con Zod
    const validatedData = createOrderSchema.parse(req.body);

    // 2. Ejecutar la lógica de negocio
    const result = await createOrderTransaction(validatedData);

    // 3. Responder al cliente
    res.status(201).json(result);
  } catch (err: any) {
    // Si es un error de Zod, le damos un formato amigable
    if (err.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de pedido no válidos',
        errors: err.errors
      });
    }
    next(err);
  }
};

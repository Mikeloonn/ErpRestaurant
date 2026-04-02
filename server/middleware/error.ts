import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ SERVER ERROR:", err.message);

  // Si el error tiene un status específico (ej: 400, 401), lo usamos.
  // De lo contrario, usamos 500 (Error interno del servidor).
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Ha ocurrido un error inesperado en el servidor'
  });
};

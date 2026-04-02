import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    // 1. Buscar al usuario en la base de datos
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Usuario o contraseña incorrectos' });
    }

    // 2. Comparar contraseña (Soporta texto plano para los actuales y Bcrypt para los nuevos)
    // Nota: Esto es una transición suave. Si la clave es '1234' entrará, 
    // pero si ya está hasheada también funcionará.
    let isMatch = false;
    if (user.password === password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Usuario o contraseña incorrectos' });
    }

    // 3. Quitar la contraseña antes de enviar los datos al frontend por seguridad
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      status: 'success',
      user: userWithoutPassword
    });

  } catch (err) {
    next(err);
  }
};

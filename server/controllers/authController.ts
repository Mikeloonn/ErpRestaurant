import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    // Seguridad Senior: Usamos un mensaje genérico para no dar pistas a atacantes
    const genericError = 'Usuario o contraseña incorrectos';

    if (!user) {
      return res.status(401).json({ status: 'error', message: genericError });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: genericError });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ status: 'success', user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, username, role, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, username, role, password) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name, username, role, hashedPassword]
    );
    res.status(201).json({ status: 'success', user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya existe' });
    }
    next(err);
  }
};

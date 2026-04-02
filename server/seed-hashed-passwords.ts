import { pool } from './db';
import bcrypt from 'bcryptjs';

const seedHashedPasswords = async () => {
  console.log('--- SEEDING HASHED PASSWORDS ---');
  const client = await pool.connect();

  try {
    const { rows: users } = await client.query('SELECT id, username, password FROM users');
    
    for (const user of users) {
      // Si la contraseña ya parece un hash de bcrypt (empieza con $2a$), la saltamos
      if (user.password.startsWith('$2a$')) {
        console.log(`Usuario ${user.username} ya tiene contraseña hasheada.`);
        continue;
      }

      console.log(`Hasheando contraseña para ${user.username}...`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      console.log(`✅ ${user.username} actualizado.`);
    }

    console.log('--- SEEDING COMPLETO ---');
  } catch (err) {
    console.error('❌ Error seeding passwords:', err);
  } finally {
    client.release();
    process.exit();
  }
};

seedHashedPasswords();

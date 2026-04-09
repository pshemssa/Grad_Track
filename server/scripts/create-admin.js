import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run admin:create -- <email> <password>');
  process.exit(1);
}

const password_hash = await bcrypt.hash(password, 10);

await prisma.adminUser.upsert({
  where: { email: email.trim().toLowerCase() },
  update: { password_hash, role: 'admin' },
  create: { email: email.trim().toLowerCase(), password_hash, role: 'admin' },
});

console.log(`Admin user ready: ${email}`);
await prisma.$disconnect();

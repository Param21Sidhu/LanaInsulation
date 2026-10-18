// Creates the referral tables from db/schema.sql. Usage:
//   vercel env pull .env.local   # or set DATABASE_URL yourself
//   npm run db:migrate
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run `vercel env pull .env.local` or export it first.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');

// The schema has no semicolons inside strings, so splitting is safe.
const statements = schema
  .replace(/--.*$/gm, '')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) await sql.query(statement);
console.log(`Applied ${statements.length} schema statements.`);

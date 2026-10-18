import { neon } from '@neondatabase/serverless';

// Neon's HTTP driver: one-shot queries, no connection pool to manage in
// serverless functions. Created lazily so a missing DATABASE_URL produces a
// clean 503 instead of crashing the function at import time.
let sql = null;

export const db = {
  isConfigured() {
    return Boolean(process.env.DATABASE_URL);
  },

  // Runs a parameterized query ($1, $2, ...) and resolves to the result rows.
  query(text, params = []) {
    sql ??= neon(process.env.DATABASE_URL);
    return sql.query(text, params);
  },
};

import { Pool, PoolConfig } from 'pg';

const getDatabaseConfig = (): PoolConfig => {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) {
    return { connectionString };
  }

  const user = process.env.DB_USER;
  const host = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const password = process.env.DB_PASSWORD;
  const portRaw = process.env.DB_PORT;
  const port = Number(portRaw);

  if (!user || !host || !database || !password || !portRaw || Number.isNaN(port)) {
    throw new Error(
      'Database config is missing. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, and DB_PORT.',
    );
  }

  return {
    user,
    host,
    database,
    password,
    port,
  };
};

export const databaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    const pool = new Pool(getDatabaseConfig());

    await pool.query('SELECT 1');
    return pool;
  },
};

import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
      ? { rejectUnauthorized: true }
      : undefined,
};

// Prevent connection leaks during Next.js Hot Module Replacement (HMR) in development
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool = globalForDb.pgPool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool client error:", error);
});

export default pool;

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection with connection pooling
// Connection pool settings for better performance
const client = postgres(connectionString, {
  prepare: false, // Disable prefetch as it's not supported for "Transaction" pool mode
  max: 20, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other modules
export * from './schema.js';

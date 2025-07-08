import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle client
export const db = drizzle(pool, { schema });

// Export schema for use in other files
export * from "./schema"; 
import * as dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  max: 20, 
  idle_timeout: 20,
  connect_timeout: 10, 
  prepare: false, // Better performance for transactions
});

export const db = drizzle(client, { schema });

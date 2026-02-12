import * as dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 0,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });

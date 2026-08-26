import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Next carga .env.local solo; drizzle-kit y tsx no. Hay que hacerlo a mano.
config({ path: ".env.local" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;

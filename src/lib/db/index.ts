import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y llénalo.");

// En desarrollo Next recarga el módulo en cada cambio; sin esta caché se abren
// conexiones nuevas hasta agotar el pool de Neon.
const globalForDb = globalThis as unknown as { _sql?: ReturnType<typeof postgres> };
const client = globalForDb._sql ?? postgres(url, { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb._sql = client;

export const db = drizzle(client, { schema });
export { schema };

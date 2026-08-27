import { handlers } from "@/lib/auth";

/** Las rutas que Google llama de vuelta: /api/auth/callback/google y compañía. */
export const { GET, POST } = handlers;

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "file:./data/herdeiros.db";

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace(/^file:/, "");
  const resolvedDir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }
}

const globalForDb = globalThis as unknown as {
  libsqlClient?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.libsqlClient ??
  createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsqlClient = client;
}

export const db = drizzle(client, { schema });
export { schema };


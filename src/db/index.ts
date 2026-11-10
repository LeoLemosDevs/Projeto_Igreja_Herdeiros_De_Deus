import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle as drizzleWeb } from "drizzle-orm/libsql/web";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "file:./data/herdeiros.db";
const isLocalFile = databaseUrl.startsWith("file:");

if (isLocalFile) {
  try {
    const filePath = databaseUrl.replace(/^file:/, "");
    const resolvedDir = path.dirname(path.resolve(process.cwd(), filePath));
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }
  } catch {
    // Ignora caso esteja em ambiente somente leitura durante build
  }
}

const globalForDb = globalThis as unknown as {
  libsqlClient?: Client;
};

function initDatabase(): { client: Client; db: LibSQLDatabase<typeof schema> } {
  if (!isLocalFile) {
    // Em producao (Turso na Vercel), usa cliente Web/HTTP puro sem binarios nativos
    const webClient =
      globalForDb.libsqlClient ??
      createWebClient({
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.libsqlClient = webClient;
    }

    return {
      client: webClient,
      db: drizzleWeb(webClient, { schema }),
    };
  }

  // Em desenvolvimento local (file:./data/herdeiros.db), usa o cliente SQLite local
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createNodeClient } = require("@libsql/client") as typeof import("@libsql/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleNode } = require("drizzle-orm/libsql") as typeof import("drizzle-orm/libsql");

  const localClient =
    globalForDb.libsqlClient ??
    createNodeClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.libsqlClient = localClient;
  }

  return {
    client: localClient,
    db: drizzleNode(localClient, { schema }),
  };
}

const initialized = initDatabase();

export const client = initialized.client;
export const db = initialized.db;
export { schema };

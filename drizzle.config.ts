import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || "file:./data/herdeiros.db";
if (dbUrl.startsWith("file:")) {
  const dir = path.dirname(path.resolve(process.cwd(), dbUrl.replace(/^file:/, "")));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: dbUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});

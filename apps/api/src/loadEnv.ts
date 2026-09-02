import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnv(): void {
  const file = resolve(process.cwd(), ".env");
  const alt = resolve(process.cwd(), "apps/api/.env");
  const path = existsSync(file) ? file : existsSync(alt) ? alt : null;
  if (!path) return;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

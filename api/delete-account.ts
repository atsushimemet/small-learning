import { createClerkClient, verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

const json = (res: any, status: number, body: Json) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const setCors = (req: any, res: any) => {
  const origin = req.headers?.origin as string | undefined;
  const allowOrigin = process.env.CORS_ALLOW_ORIGIN;

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Vary", "Origin");
  } else if (origin) {
    // When running on the same origin (Vercel), Origin can be absent.
    // For local dev we allow the requesting origin if not explicitly configured.
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
};

const getBearerToken = (req: any) => {
  const header = (req.headers?.authorization ?? req.headers?.Authorization) as
    | string
    | undefined;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

const readLocalEnvValue = (key: string) => {
  for (const filename of [".env.local", ".env"]) {
    const filePath = join(process.cwd(), filename);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || match[1] !== key) continue;

      const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
      return value || undefined;
    }
  }

  return undefined;
};

const requireEnv = (key: string) => {
  const value = process.env[key] ?? readLocalEnvValue(key);
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export default async function handler(req: any, res: any) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      json(res, 401, { ok: false, error: "Missing bearer token" });
      return;
    }

    const secretKey = requireEnv("CLERK_SECRET_KEY");
    const verifiedToken = await verifyToken(token, { secretKey });
    const userId = verifiedToken.sub;
    if (!userId) {
      json(res, 401, { ok: false, error: "Invalid token" });
      return;
    }

    const supabaseUrl = requireEnv("VITE_SUPABASE_URL");
    const supabaseSecretKey = requireEnv("SUPABASE_SECRET_KEY");
    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const tablesToDelete = ["learning_logs", "learning_tags", "learning_triggers"] as const;

    for (const table of tablesToDelete) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) {
        throw new Error(`Supabase delete failed (${table}): ${error.message}`);
      }
    }

    const clerk = createClerkClient({ secretKey });
    await clerk.users.deleteUser(userId);

    json(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    json(res, 500, { ok: false, error: "Failed to delete account" });
  }
}

/**
 * After 021 is applied on work SNS Project, sync Centre mentor_user_profiles → profiles.
 * Usage: node scripts/sync-centre-profiles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const p = path.join(__dirname, "..", ".env.local");
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function roleMap(r) {
  const v = String(r || "").toLowerCase();
  if (v === "admin") return "admin";
  if (v === "coordinator" || v === "cordinator") return "coordinator";
  if (v === "mentor") return "mentor";
  if (v === "organiser") return "organiser";
  return null;
}

async function main() {
  loadEnv();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  if (url.includes("hyjqsfxqfgnckuwkkwwi")) {
    throw new Error("Refusing personal sns-vol — use work dprvfkytknejqvaydnut");
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const probe = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!probe.ok) {
    console.error(
      "profiles table missing. Run 021 first.",
      await probe.text(),
    );
    process.exit(1);
  }

  const { data: mentors, error } = await sb
    .from("mentor_user_profiles")
    .select("*");
  if (error) throw error;

  let ok = 0;
  let skip = 0;
  for (const m of mentors ?? []) {
    if (!m.auth_user_id) {
      skip++;
      continue;
    }
    const role = roleMap(m.app_role);
    if (!role) {
      skip++;
      continue;
    }
    const { error: upErr } = await sb.from("profiles").upsert(
      {
        id: m.auth_user_id,
        name: m.display_name || m.username || m.email || "User",
        role,
        status: "active",
        centre: m.center || null,
        college: m.center || "",
        phone: "",
        skills: [],
      },
      { onConflict: "id" },
    );
    if (upErr) {
      console.error("fail", m.username, upErr.message);
    } else {
      ok++;
      console.log("synced", m.username, role, m.center);
    }
  }
  console.log({ ok, skip, total: mentors?.length ?? 0 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

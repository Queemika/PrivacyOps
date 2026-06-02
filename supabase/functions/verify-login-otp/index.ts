import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const rawEmail = typeof body.email === "string" ? body.email : userData.user.email;
    if (!rawEmail || !/^\d{6}$/.test(code)) return json({ error: "Invalid input" }, 400);
    const email = rawEmail.trim().toLowerCase();

    if (email !== (userData.user.email || "").toLowerCase()) {
      return json({ error: "Email mismatch" }, 403);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { data: rows } = await admin
      .from("login_otps")
      .select("id, otp_hash, expires_at, used, attempts")
      .eq("email", email)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    const row = rows?.[0];
    if (!row) return json({ ok: false, error: "No active code. Request a new one." }, 400);
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await admin.from("login_otps").update({ used: true }).eq("id", row.id);
      return json({ ok: false, error: "Code expired. Request a new one." }, 400);
    }
    if (row.attempts >= 5) {
      await admin.from("login_otps").update({ used: true }).eq("id", row.id);
      return json({ ok: false, error: "Too many attempts. Request a new code." }, 429);
    }

    const hash = await sha256Hex(code);
    if (hash !== row.otp_hash) {
      await admin.from("login_otps").update({ attempts: row.attempts + 1 }).eq("id", row.id);
      return json({ ok: false, error: "Invalid code." }, 400);
    }

    await admin.from("login_otps").update({ used: true }).eq("id", row.id);

    await admin.auth.admin.updateUserById(userData.user.id, {
      app_metadata: { ...(userData.user.app_metadata ?? {}), mfa_verified_at: new Date().toISOString() },
    });

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

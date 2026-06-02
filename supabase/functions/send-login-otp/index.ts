import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
    const rawEmail = typeof body.email === "string" ? body.email : userData.user.email;
    if (!rawEmail) return json({ error: "Email required" }, 400);
    const email = rawEmail.trim().toLowerCase();

    if (email !== (userData.user.email || "").toLowerCase()) {
      return json({ error: "Email mismatch" }, 403);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Rate limit: max 3 in last 10 min, 30s cooldown between sends
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: recent } = await admin
      .from("login_otps")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (recent && recent.length >= 3) {
      return json({ error: "Too many requests. Try again in a few minutes." }, 429);
    }
    if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at).getTime();
      if (Date.now() - last < 30_000) {
        return json({ error: "Please wait before requesting another code." }, 429);
      }
    }

    // Invalidate previous active codes
    await admin.from("login_otps").update({ used: true }).eq("email", email).eq("used", false);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const otp_hash = await sha256Hex(code);
    const expires_at = new Date(Date.now() + 10 * 60_000).toISOString();

    const { error: insErr } = await admin.from("login_otps").insert({ email, otp_hash, expires_at });
    if (insErr) return json({ error: insErr.message }, 500);

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — OTP for", email, "is", code);
      return json({ ok: true, dev: true });
    }

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f172a">
        <h2 style="margin:0 0 8px">PrivacyOps verification</h2>
        <p style="color:#475569;margin:0 0 20px">Use this code to finish signing in. It expires in 10 minutes.</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f1f5f9;padding:16px;text-align:center;border-radius:8px">${code}</div>
        <p style="color:#94a3b8;font-size:12px;margin-top:20px">If you didn't request this, you can ignore the email.</p>
      </div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "PrivacyOps <no-reply@privacyops.com>",
        to: [email],
        subject: "Your PrivacyOps verification code",
        html,
      }),
    });

    if (!resendRes.ok) {
      const t = await resendRes.text();
      console.error("Resend error:", resendRes.status, t);
      // Resend test mode: only the account owner inbox receives mail until a domain is verified.
      // Surface the code so the prototype stays usable.
      const notice =
        resendRes.status === 403 && t.includes("testing emails")
          ? "Resend test mode — verify a domain at resend.com/domains to send to other inboxes."
          : "Email delivery failed; using dev fallback.";
      return json({ ok: true, devCode: code, devNotice: notice });
    }

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

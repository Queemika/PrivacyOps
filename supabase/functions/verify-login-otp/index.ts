import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));

  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("===== VERIFY OTP START =====");

    const authHeader = req.headers.get("Authorization");

    console.log("AUTH HEADER PRESENT:", !!authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("NO BEARER TOKEN");
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();

    console.log("USER FETCH RESULT:", {
      hasUser: !!userData?.user,
      error: userErr?.message,
    });

    if (userErr || !userData.user) {
      return json(
        {
          error: userErr?.message || "Unauthorized",
        },
        401,
      );
    }

    const body = await req.json().catch(() => ({}));

    const code = typeof body.code === "string" ? body.code.trim() : "";

    const rawEmail = typeof body.email === "string" ? body.email : userData.user.email;

    console.log("REQUEST BODY:", {
      email: rawEmail,
      codeLength: code.length,
    });

    if (!rawEmail) {
      return json(
        {
          error: "Email required",
        },
        400,
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return json(
        {
          error: "Invalid code format",
        },
        400,
      );
    }

    const email = rawEmail.toLowerCase().trim();

    if (email !== (userData.user.email || "").toLowerCase()) {
      console.error("EMAIL MISMATCH", {
        requestEmail: email,
        authEmail: userData.user.email,
      });

      return json(
        {
          error: "Email mismatch",
        },
        403,
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: {
        persistSession: false,
      },
    });

    const { data: rows, error: otpErr } = await admin
      .from("login_otps")
      .select("id, otp_hash, expires_at, used, attempts")
      .eq("email", email)
      .eq("used", false)
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

    console.log("OTP QUERY:", {
      rowsFound: rows?.length || 0,
      error: otpErr?.message,
    });

    if (otpErr) {
      return json(
        {
          error: otpErr.message,
        },
        500,
      );
    }

    const row = rows?.[0];

    if (!row) {
      return json(
        {
          error: "No active code found",
        },
        400,
      );
    }

    console.log("OTP ROW:", {
      id: row.id,
      used: row.used,
      attempts: row.attempts,
      expires_at: row.expires_at,
    });

    if (new Date(row.expires_at).getTime() < Date.now()) {
      console.log("OTP EXPIRED");

      await admin.from("login_otps").update({ used: true }).eq("id", row.id);

      return json(
        {
          error: "Code expired",
        },
        400,
      );
    }

    if ((row.attempts || 0) >= 5) {
      console.log("TOO MANY ATTEMPTS");

      await admin.from("login_otps").update({ used: true }).eq("id", row.id);

      return json(
        {
          error: "Too many attempts",
        },
        429,
      );
    }

    const hash = await sha256Hex(code);

    console.log("HASH CHECK:", {
      matches: hash === row.otp_hash,
    });

    if (hash !== row.otp_hash) {
      await admin
        .from("login_otps")
        .update({
          attempts: (row.attempts || 0) + 1,
        })
        .eq("id", row.id);

      return json(
        {
          error: "Invalid code",
        },
        400,
      );
    }

    console.log("OTP VERIFIED");

    const { error: usedErr } = await admin.from("login_otps").update({ used: true }).eq("id", row.id);

    if (usedErr) {
      console.error("MARK USED ERROR:", usedErr);

      return json(
        {
          error: usedErr.message,
        },
        500,
      );
    }

    console.log("UPDATING USER APP_METADATA");

    const updateResult = await admin.auth.admin.updateUserById(userData.user.id, {
      app_metadata: {
        ...(userData.user.app_metadata ?? {}),
        mfa_verified_at: new Date().toISOString(),
      },
    });

    console.log("UPDATE USER RESULT:", updateResult);

    if (updateResult.error) {
      return json(
        {
          error: updateResult.error.message,
        },
        500,
      );
    }

    console.log("===== VERIFY OTP SUCCESS =====");

    return json({
      ok: true,
    });
  } catch (e) {
    console.error("VERIFY OTP EXCEPTION:", e);

    return json(
      {
        error: e instanceof Error ? e.message : "Unknown error",
      },
      500,
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  rowId: string;
  drlNo: string;
  category: string;
  tags: string[];
  link?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.tags?.length) {
      return new Response(JSON.stringify({ ok: true, skipped: "no tags" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!RESEND_KEY || !LOVABLE_KEY) {
      return new Response(JSON.stringify({ ok: true, skipped: "email not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `You were tagged on ${body.category.toUpperCase()} DRL ${body.drlNo}`;
    const html = `
      <p>Hello,</p>
      <p>New assignment tag(s) added on <b>${body.category.toUpperCase()} DRL ${body.drlNo}</b>:</p>
      <p><b>${body.tags.join(", ")}</b></p>
      ${body.link ? `<p><a href="${body.link}">Open the DRL item</a></p>` : ""}
      <p>— PrivacyOps</p>
    `;
    const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_KEY}`,
        "X-Connection-Api-Key": RESEND_KEY,
      },
      body: JSON.stringify({
        from: "PrivacyOps <onboarding@resend.dev>",
        to: [user.email],
        subject,
        html,
      }),
    });
    const out = await resp.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: resp.ok, out }), {
      status: resp.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

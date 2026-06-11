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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;

    if (!body?.tags?.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          skipped: "no tags",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const authHeader = req.headers.get("Authorization") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "User email not found",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_KEY) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "RESEND_API_KEY not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const subject = `You were tagged on ${body.category.toUpperCase()} DRL ${body.drlNo}`;

    const html = `
      <p>Hello,</p>
      <p>New assignment tag(s) added on <b>${body.category.toUpperCase()} DRL ${body.drlNo}</b>:</p>
      <p><b>${body.tags.join(", ")}</b></p>
      ${body.link ? `<p><a href="${body.link}">Open the DRL item</a></p>` : ""}
      <p>— PrivacyOps</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PrivacyOps <onboarding@resend.dev>",
        to: [user.email],
        subject,
        html,
      }),
    });

    const resendBody = await resendResponse.text();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          resendStatus: resendResponse.status,
          resendResponse: resendBody,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

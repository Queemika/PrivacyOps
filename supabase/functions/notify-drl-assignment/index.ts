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
    console.log("notify-drl-assignment started");

    let body: Body;

    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON body:", err);

      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid request body",
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

    console.log("Request body:", body);

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

    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const authHeader = req.headers.get("Authorization") || "";

    console.log("Authorization header exists:", !!authHeader);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const authResult = await supabase.auth.getUser();

    console.log("Auth result:", authResult);

    const user = authResult.data?.user;

    if (!user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("Authenticated user:", user.id);
    console.log("User email:", user.email);

    if (!user.email) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "User has no email",
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
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

    console.log("RESEND_API_KEY exists:", !!RESEND_KEY);
    console.log("LOVABLE_API_KEY exists:", !!LOVABLE_KEY);

    if (!RESEND_KEY || !LOVABLE_KEY) {
      return new Response(
        JSON.stringify({
          ok: true,
          skipped: "email not configured",
        }),
        {
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

    console.log("Sending email...");

    const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_KEY}`,
        "X-Connection-Api-Key": RESEND_KEY,
      },
      body: JSON.stringify({
        from: "PrivacyOps <onboarding@resend.dev>",
        to: [user.email],
        subject,
        html,
      }),
    });

    const responseText = await resp.text();

    console.log("Email response status:", resp.status);
    console.log("Email response body:", responseText);

    if (!resp.ok) {
      console.error("Resend request failed");
      console.error("Status:", resp.status);
      console.error("Body:", responseText);

      return new Response(
        JSON.stringify({
          ok: false,
          resendStatus: resp.status,
          resendResponse: responseText,
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
        resendStatus: resp.status,
        resendResponse: responseText,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error("notify-drl-assignment failed");

    if (e instanceof Error) {
      console.error("Message:", e.message);
      console.error("Stack:", e.stack);
    } else {
      console.error(e);
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
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

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body {
  messages: { role: "user" | "assistant"; content: string }[];
  language?: "EN" | "FIL" | "Taglish";
  source?: "PH" | "GDPR" | "CCPA";
}

const sourceMap: Record<string, string> = {
  PH: "Philippine Data Privacy Act of 2012 (RA 10173), its IRR, and NPC issuances",
  GDPR: "EU General Data Protection Regulation (Regulation 2016/679)",
  CCPA: "California Consumer Privacy Act (as amended by CPRA)",
};

const langMap: Record<string, string> = {
  EN: "Respond in clear, professional English.",
  FIL: "Sumagot ka sa Filipino, malinaw at propesyonal.",
  Taglish: "Sumagot ka sa magaan na Taglish — natural mixing ng English at Filipino, parang kausap mo lang ang isang DPO.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages, language = "EN", source = "PH" } = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const system = [
      "You are Pixie, a friendly data privacy assistant inside the PrivacyOps app.",
      `Ground your answers in the ${sourceMap[source] ?? sourceMap.PH}.`,
      "Help the user with PIAs, ROPA, NPC-RS, DPO duties, breach response, and navigating the app's modules (Transcript, PIA Library, Tech Security, PRADAR, DRL, Manuals, Email Generator).",
      "Keep answers short and practical. Cite sections (e.g. 'NPC Circular 16-03') when relevant.",
      langMap[language] ?? langMap.EN,
    ].join(" ");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...messages],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Pixie is unavailable right now." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("pixie-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

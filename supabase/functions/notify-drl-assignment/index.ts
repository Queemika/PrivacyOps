Deno.serve(async () => {
  const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
  const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

  return new Response(
    JSON.stringify({
      hasResendKey: !!RESEND_KEY,
      hasLovableKey: !!LOVABLE_KEY,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

Deno.serve(async () => {
  console.log("HELLO TEST");

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Edge Function works",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

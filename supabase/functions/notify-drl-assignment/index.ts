Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      version: "VERIFY_DEPLOYMENT",
      timestamp: Date.now(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      reached: true,
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

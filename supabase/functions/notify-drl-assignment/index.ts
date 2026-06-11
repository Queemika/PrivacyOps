Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      version: "TEST-2026-06-11",
      success: true,
      message: "You reached the correct function",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

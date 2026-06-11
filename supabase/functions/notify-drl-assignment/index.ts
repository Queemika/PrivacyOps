Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      version: "2026-06-11-test",
      function: "notify-drl-assignment",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

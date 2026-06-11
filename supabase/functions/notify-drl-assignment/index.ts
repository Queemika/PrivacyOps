Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      version: "DIRECT_RESEND_TEST_V1",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

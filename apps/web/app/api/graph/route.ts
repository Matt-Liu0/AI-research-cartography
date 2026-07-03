// GET /api/graph — returns full node/edge set for canvas render, spec §4.7
export async function GET() {
  return new Response(null, { status: 501 });
}

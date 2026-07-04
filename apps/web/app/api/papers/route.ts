import { prisma } from "@/lib/prisma";
import { toPaperDTO } from "@/lib/serializers/paper";

// GET /api/papers — list all papers for the /papers library page.
export async function GET() {
  const rows = await prisma.paper.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(rows.map(toPaperDTO));
}

// POST /api/papers/upload — spec §4.7. Not yet implemented (out of scope for Part 1).
export async function POST(request: Request) {
  return new Response(null, { status: 501 });
}

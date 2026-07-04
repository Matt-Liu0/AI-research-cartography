import { prisma } from "@/lib/prisma";
import { toPaperDTO } from "@/lib/serializers/paper";

// POST /api/papers/:id/retry — re-run extraction on a failed paper, no re-upload.
// Note: this only flips status back to "queued" — there is no real extraction pipeline
// yet (apps/extraction-service is unimplemented), so nothing further processes the row
// in Part 1. This proves the button -> endpoint -> DB path is real.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await prisma.paper.findUnique({ where: { id } });
  if (!existing) {
    return new Response(null, { status: 404 });
  }
  if (existing.status !== "failed") {
    return Response.json(
      { error: "Only failed papers can be retried" },
      { status: 409 }
    );
  }
  const updated = await prisma.paper.update({
    where: { id },
    data: { status: "queued" },
  });
  return Response.json(toPaperDTO(updated));
}

import { prisma } from "@/lib/prisma";
import { toPaperDTO } from "@/lib/serializers/paper";

// GET /api/papers/:id — fetch paper metadata + extraction record, spec §4.7
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = await prisma.paper.findUnique({ where: { id } });
  if (!row) {
    return new Response(null, { status: 404 });
  }
  return Response.json(toPaperDTO(row));
}

// DELETE /api/papers/:id — remove a paper from the library
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await prisma.paper.findUnique({ where: { id } });
  if (!existing) {
    return new Response(null, { status: 404 });
  }
  await prisma.paper.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

import { prisma } from "@/lib/prisma";
import { toPaperDTO } from "@/lib/serializers/paper";
import { uploadPdf } from "@/lib/storage";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";

// POST /api/papers/upload — spec §4.7. Accepts a single PDF (batch + CSV manifest
// deferred, see spec §4.2), persists it to object storage, and creates a `queued` row.
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return Response.json({ error: "File exceeds 25MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { key } = await uploadPdf(buffer, file.name);

  const row = await prisma.paper.create({
    data: {
      filename: file.name,
      title: file.name,
      authors: [],
      storageKey: key,
      status: "queued",
    },
  });

  return Response.json(toPaperDTO(row), { status: 201 });
}

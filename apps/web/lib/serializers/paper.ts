import type { Paper as PrismaPaper } from "@prisma/client";
import type { Paper } from "@/types/paper";

type PaperExtraction = Paper["extraction"];

const emptyExtraction: PaperExtraction = {
  claims: [],
  methods: [],
  datasets: [],
  entities: [],
};

export function toPaperDTO(row: PrismaPaper): Paper {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    authors: row.authors,
    year: row.year ?? undefined,
    source_url: row.sourceUrl ?? undefined,
    status: row.status,
    sections: row.sections,
    extraction: (row.extraction as PaperExtraction | null) ?? emptyExtraction,
    created_at: row.createdAt.toISOString(),
  };
}

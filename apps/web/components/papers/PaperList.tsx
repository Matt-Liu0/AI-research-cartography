"use client";

import type { Paper } from "@/types/paper";
import { PaperRow } from "./PaperRow";

export function PaperList({
  papers,
  selectedIds,
  onToggleSelect,
  onDelete,
  onRetry,
  onOpenPreview,
}: {
  papers: Paper[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenPreview: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200">
      {papers.map((paper) => (
        <PaperRow
          key={paper.id}
          paper={paper}
          selected={selectedIds.has(paper.id)}
          onToggleSelect={onToggleSelect}
          onDelete={onDelete}
          onRetry={onRetry}
          onOpenPreview={onOpenPreview}
        />
      ))}
    </div>
  );
}

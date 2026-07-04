"use client";

import type { Paper } from "@/types/paper";

const statusStyles: Record<Paper["status"], string> = {
  extracted: "bg-green-100 text-green-800",
  queued: "bg-gray-100 text-gray-700",
  parsing: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

export function PaperRow({
  paper,
  selected,
  onToggleSelect,
  onDelete,
  onRetry,
  onOpenPreview,
}: {
  paper: Paper;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenPreview: (id: string) => void;
}) {
  const selectable = paper.status === "extracted";

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 last:border-b-0">
      <input
        type="checkbox"
        checked={selected}
        disabled={!selectable}
        onChange={() => onToggleSelect(paper.id)}
        className="h-4 w-4 disabled:opacity-30"
        aria-label={`Select ${paper.title}`}
      />

      <button
        onClick={() => onOpenPreview(paper.id)}
        className="flex-1 truncate text-left text-sm font-medium text-gray-900 hover:underline"
      >
        {paper.title}
      </button>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[paper.status]}`}
      >
        {paper.status}
      </span>

      {paper.status === "failed" && (
        <button
          onClick={() => onRetry(paper.id)}
          className="shrink-0 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          Retry
        </button>
      )}

      <button
        onClick={() => onDelete(paper.id)}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}

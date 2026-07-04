"use client";

import type { Paper } from "@/types/paper";

// Reduced-scope preview for Part 1: no PDF rendering (no file storage/signed-URL infra
// exists yet), just the metadata already available from the papers list.
export function PaperMetadataPreview({
  paper,
  onClose,
}: {
  paper: Paper;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{paper.title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown authors"}
          {paper.year ? ` · ${paper.year}` : ""}
        </p>

        {paper.sections.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Sections</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
              {paper.sections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
          </div>
        )}

        {paper.extraction.claims.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Claims</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
              {paper.extraction.claims.map((claim) => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </div>
        )}

        {paper.extraction.methods.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Methods</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
              {paper.extraction.methods.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </div>
        )}

        {paper.status !== "extracted" && (
          <p className="mt-4 text-sm italic text-gray-400">
            This paper hasn&apos;t finished extraction yet ({paper.status}), so metadata
            may be incomplete.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { papersKey } from "@/lib/queryKeys";
import { deletePaper, fetchPapers, retryPaper } from "@/lib/api/papers";
import { PaperList } from "./PaperList";
import { Toolbar } from "./Toolbar";
import { EmptyState } from "./EmptyState";
import { PaperMetadataPreview } from "@/components/preview/PaperMetadataPreview";

const IN_PROGRESS_STATUSES = new Set(["queued", "parsing"]);

export function PapersLibrary() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: papers, isLoading, isError } = useQuery({
    queryKey: papersKey,
    queryFn: fetchPapers,
    refetchInterval: (query) => {
      const rows = query.state.data ?? [];
      const hasInProgress = rows.some((paper) => IN_PROGRESS_STATUSES.has(paper.status));
      return hasInProgress ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaper,
    onSuccess: (_data, id) => {
      setActionError(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: papersKey });
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
  });

  const retryMutation = useMutation({
    mutationFn: retryPaper,
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: papersKey });
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
  });

  function toggleSelect(id: string) {
    const paper = papers?.find((p) => p.id === id);
    if (!paper || paper.status !== "extracted") return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading papers...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load papers.</p>;
  }

  const previewPaper = papers?.find((p) => p.id === previewId) ?? null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Papers</h1>

      {actionError && (
        <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="ml-3 shrink-0 font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!papers || papers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Toolbar selectedIds={selectedIds} />
          <PaperList
            papers={papers}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onDelete={(id) => deleteMutation.mutate(id)}
            onRetry={(id) => retryMutation.mutate(id)}
            onOpenPreview={(id) => setPreviewId(id)}
          />
        </>
      )}

      {previewPaper && (
        <PaperMetadataPreview paper={previewPaper} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
}

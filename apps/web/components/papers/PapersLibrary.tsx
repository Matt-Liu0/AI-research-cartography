"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { papersKey } from "@/lib/queryKeys";
import { deletePaper, fetchPapers, retryPaper } from "@/lib/api/papers";
import { PaperList } from "./PaperList";
import { Toolbar } from "./Toolbar";
import { EmptyState } from "./EmptyState";
import { PaperMetadataPreview } from "@/components/preview/PaperMetadataPreview";

const IN_PROGRESS_STATUSES = new Set(["queued", "parsing"]);

// Selection and preview state live in the URL (not useState) so a refresh
// doesn't silently discard which papers were checked or which was open.
export function PapersLibrary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedIds = useMemo(() => {
    const raw = searchParams.get("selected");
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  }, [searchParams]);

  const previewId = searchParams.get("preview");

  const updateParams = useCallback(
    (updates: { selected?: Set<string>; preview?: string | null }) => {
      const next = new URLSearchParams(searchParams.toString());
      if ("selected" in updates) {
        const ids = Array.from(updates.selected ?? []);
        if (ids.length > 0) {
          next.set("selected", ids.join(","));
        } else {
          next.delete("selected");
        }
      }
      if ("preview" in updates) {
        if (updates.preview) {
          next.set("preview", updates.preview);
        } else {
          next.delete("preview");
        }
      }
      const query = next.toString();
      router.replace(query ? `/papers?${query}` : "/papers");
    },
    [router, searchParams]
  );

  function setPreviewId(id: string | null) {
    updateParams({ preview: id });
  }

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
      const next = new Set(selectedIds);
      next.delete(id);
      updateParams({ selected: next });
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

    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateParams({ selected: next });
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

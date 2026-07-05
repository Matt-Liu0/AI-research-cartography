"use client";

import { useRouter } from "next/navigation";
import { MAX_COMPARE_PAPERS } from "@/lib/constants";

export function Toolbar({ selectedIds }: { selectedIds: Set<string> }) {
  const router = useRouter();
  const canCompare = selectedIds.size === MAX_COMPARE_PAPERS;

  function handleCompare() {
    // /compare's URL contract (?a=&b=) and this destructuring both assume
    // exactly 2 papers. Raising MAX_COMPARE_PAPERS alone would silently drop
    // ids past the first 2 rather than enabling N-paper compare — both this
    // function and the /compare route would need to change together.
    if (MAX_COMPARE_PAPERS !== 2) {
      throw new Error(
        "Toolbar.handleCompare assumes MAX_COMPARE_PAPERS === 2; update the /compare URL contract before changing this constant."
      );
    }
    const [a, b] = Array.from(selectedIds);
    router.push(`/compare?a=${a}&b=${b}`);
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Compare {selectedIds.size > 0 && `(${selectedIds.size}/${MAX_COMPARE_PAPERS})`}
      </button>

      <button
        onClick={() => router.push("/board")}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Generate cartography board
      </button>
    </div>
  );
}

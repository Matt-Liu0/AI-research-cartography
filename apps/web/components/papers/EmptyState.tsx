"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
      <p className="text-sm text-gray-500">No papers yet.</p>
      <Link
        href="/upload"
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Add papers
      </Link>
    </div>
  );
}

import { Suspense } from "react";
import { PapersLibrary } from "@/components/papers/PapersLibrary";

export default function PapersPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading papers...</p>}>
        <PapersLibrary />
      </Suspense>
    </main>
  );
}

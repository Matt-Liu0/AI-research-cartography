# Paper Comparison & Cartography Board — Frontend Flow Design

## 1. Problem & Scope

The existing spec (`spec/research-paper-cartographer-spec.md`) defines an upload modal,
individual paper preview windows, and a graph/canvas board, but has no concept of a
focused, side-by-side comparison between a small number of papers. This design adds that
flow — a persistent library page, a 2-paper split/compare view, and the wiring needed for
the cartography board to be generated on demand from that same library.

This design covers frontend pages/navigation, the data each page needs, and the backend
API surface required to support them. It builds on top of the V1 backend spec (§4) —
it does not change the core extraction/relationship-detection pipeline, only how the
frontend organizes access to it.

## 2. Pages & Navigation

Four pages:

- **`/upload`** — existing upload modal flow (spec §3.1): drag-and-drop + file picker,
  optional CSV manifest, per-file progress/status.
- **`/papers`** — new persistent library page. The hub users return to across sessions;
  lists every uploaded paper and is the entry point into both the compare and board flows.
- **`/compare?a=<paperId>&b=<paperId>`** — new split view comparing exactly 2 papers.
- **`/board`** — existing cartography board (spec §3.3), covering all uploaded papers.

## 3. `/papers` — Library Page

Responsibilities:

- **List all papers** with live status (`queued` / `parsing` / `extracted` / `failed`).
  Requires a new `GET /api/papers` endpoint (the current spec only has
  `GET /api/papers/:id` for a single paper). Papers still `queued`/`parsing` poll for
  status updates (TanStack Query interval refetch) rather than requiring a manual reload.
- **Selection** — checkboxes next to `extracted`-status papers only (`failed`/in-progress
  papers are not selectable). Exactly 2 selected enables a "Compare" button that routes to
  `/compare`. The 2-paper cap is a single named constant, not hardcoded into layout logic,
  so it can be raised later without a rewrite.
- **"Generate cartography board"** — always-available button, independent of checkbox
  state, routes to `/board`. Scoped to all `extracted`-status papers.
- **Click a paper row** (not the checkbox) — opens that paper's existing preview window
  (spec §3.2), reusing `GET /api/papers/:id/preview`.
- **Delete a paper** — new `DELETE /api/papers/:id`.
- **Retry a failed extraction** — new `POST /api/papers/:id/retry`, re-runs extraction
  without requiring re-upload of the file.
- **Empty state** — "Add papers" CTA when the library has zero papers, per spec §3.1.

## 4. `/compare` — Split View

- Reached only from `/papers`, after selecting exactly 2 `extracted` papers.
- **Data fetching approach:** reuse existing endpoints and stitch client-side (not a new
  bundled endpoint). On page load, fire three parallel requests via TanStack Query:
  - `GET /api/papers/:id` for paper A and paper B — fast DB reads, resolve quickly.
  - `POST /api/relationships/compute` (or `GET /api/relationships/:id` if already
    computed) for the pair — slower, involves an LLM call (spec §4.5).

  This is chosen over a single bundled `/api/compare` endpoint specifically because the
  relationship computation is the slow part: keeping it as a separate request lets the PDF
  panes and per-paper claims render immediately while the relationship/evidence panel
  shows its own independent loading state, rather than blocking the entire view on the
  slowest piece. A bundled endpoint would also duplicate the paper/relationship
  serialization logic that `GET /api/papers/:id` and the relationship endpoints already
  own, creating two places that need to stay in sync as those shapes evolve.

- **Layout:** two PDF panes side by side at the top (reusing the existing preview-window
  PDF rendering), with a comparison section below, split into:
  - **Common knowledge** — the relationship's `explanation` + `evidence_spans`, plus each
    paper's `claims`/`entities` shown side by side.
  - **Structural difference** — a section-outline comparison (see data model change,
    §6) plus a methods-focused diff using each paper's `extraction.methods`.
- **Loading states** are independent per section: PDF panes and claims render as soon as
  their fetch resolves; the common-knowledge/structural-diff panel waits on the
  relationship fetch separately.

## 5. `/board` — Cartography Board

- Scoped to all `extracted`-status papers in the library (consistent with what's
  selectable on `/papers`).
- **Relationship computation on generation:** before rendering, determine which paper
  pairs already have a computed `Relationship` record and skip those (cache-skip);
  compute only the missing pairs, synchronously, via the existing
  `POST /api/relationships/compute`. Given this is O(n²) in the number of papers, show a
  progress indicator (e.g. "computing 12/45 pairs...") rather than a bare spinner while
  this runs.

  This synchronous approach is chosen over a background-job/streaming-edges approach for
  V1 because the stated V1 scope (spec §2) is manual upload, single-user, small
  libraries — building job-queue/streaming infrastructure isn't justified until library
  sizes are large enough to make the O(n²) wait actually painful. If that becomes a real
  problem, the natural upgrade path is: render nodes immediately, stream edges in as each
  pair resolves via a background job queue (already provisioned in infra as
  Inngest/BullMQ + Redis, spec §5.4).

- Once all pairs resolve, fetch `GET /api/graph` for the full node/edge set and render via
  React Flow.
- **V1 feature set:**
  - Pan/zoom (React Flow default)
  - Auto-layout on load (force-directed/dagre — papers have no inherent position)
  - Edge legend (color/thickness → relationship type/strength key — needed since the
    board already encodes both visually per spec §3.3)
  - Minimap (React Flow built-in component)
  - Search/jump to a paper by title (highlights + pans to the node)
  - Filter by relationship type and/or strength threshold (reduce edge clutter)
  - Neighbor highlight on node select (dim everything except direct connections)
  - "+" add-papers button on the board itself (wires the existing upload modal in,
    per spec §3.1's "persistent + on the board" trigger)
  - Node click → opens paper's preview window; edge click → drawer with LLM explanation
    (both already speced, §3.3)
- **Deferred past V1:** clustering/grouping, manual layout persistence, board
  export/screenshot, per-edge recompute button.

## 6. API & Data Model Changes

New endpoints, beyond the current spec (§4.7):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/papers` | List all papers for `/papers`, with status |
| DELETE | `/api/papers/:id` | Delete a paper from the library |
| POST | `/api/papers/:id/retry` | Re-run extraction on a failed paper, no re-upload |

Also required: the spec's existing `GET /api/papers/:id` and `GET /api/papers/:id/preview`
need an actual `[id]` dynamic route segment — the current stub
(`apps/web/app/api/papers/route.ts`) only implements `POST`. This design requires
building that dynamic segment out, not just adding the three new endpoints above.

Data model change:

- Add `sections: string[]` to the `Paper` type (`apps/web/types/paper.ts`) — **section
  headers only** (e.g. `["Introduction", "Related Work", "Method", "Results"]`), not full
  section text. Currently the frontend type deliberately omits the backend's `sections{}`
  field; it's needed for the split view's structural-outline comparison.

Reused as-is, no changes:

- `POST /api/relationships/compute` — used by both `/compare` (single pair, triggered
  automatically on page load) and `/board` (batch, skipping already-cached pairs).
- `GET /api/relationships/:id` — relationship detail (type, strength, explanation,
  evidence_spans).
- `GET /api/graph` — full node/edge set for board render.

## 7. Out of Scope

- Live status via websocket/SSE (polling is sufficient for V1 library sizes).
- Background job queue / streaming edge resolution on the board (deferred until O(n²)
  compute time is a demonstrated problem).
- More than 2 papers in the split view (the cap is a named constant so this can change
  later without restructuring the page).
- Manual node layout persistence, board export, clustering.
- Everything already out of scope per the base spec (§2): live paper-feed ingestion,
  multi-user boards, versioned graphs, citation-graph crawling.

## 8. Open Questions Carried Forward

- At what library size does the board's synchronous O(n²) compute actually become
  painful enough to justify the streaming/background-job upgrade path described in §5?
- Should a deleted paper's cached relationships be deleted too, or orphaned/cleaned up
  lazily? Not addressed by this design.

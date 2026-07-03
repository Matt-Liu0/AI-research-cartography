# Research Paper Cartography

Source of truth: Google Doc "Research Paper AI Cartographer Spec"
(https://docs.google.com/document/d/1UPTGphdraKy7jOovcZbbUFN0vZlaiWMIscuAyi7SGN4/edit)

Keep this file as a local mirror/snapshot for offline reference. Edit the Google Doc
first for substantive changes, then sync this file.

## 1. Problem Statement

Research output is growing faster than any individual can track. Researchers struggle to:

- Keep up with recent publications in their field(s)
- Organize literature reviews around meaningful relationships (not just chronology)
- Spot cross-disciplinary connections that aren't obvious from citations alone

LLMs alone don't solve this: they lack live access to the newest papers, and even when
given papers directly, they don't have a persistent, structured way of representing how
papers relate to each other over time.

**Core idea:** treat papers as nodes on a map. Relationships (citation, semantic
similarity, shared methods, contradiction, extension) are edges. The "cartography" is
the graph itself — something you can navigate, not just read.

## 2. V1 Scope

- Manual upload only (no live paper-feed ingestion yet)
- Start with pairwise relationships (2 papers), design the model so it generalizes to N papers
- One relationship-detection pipeline (LLM extraction + embedding similarity), not the full taxonomy
- Single-user, no auth/collaboration yet

**Explicitly out of scope for V1:** live arXiv/Semantic Scholar sync, multi-user boards,
versioned graphs, citation-graph crawling beyond the uploaded set.

## 3. Frontend Spec

### 3.1 Upload Modal
- Triggered from an empty-state "Add papers" button or a persistent "+" on the board
- Drag-and-drop zone + file picker, accepts multiple .pdf files in one action
- Also accepts a .csv manifest (§4.2) for bulk metadata paired with PDFs
- Per-file upload progress + status (queued → parsing → extracted → failed)
- Validation: file type, size cap (e.g. 25MB/file), duplicate detection by hash

### 3.2 Paper Preview Windows
- Each parsed paper gets a preview pane (tabs/cards, not a monolithic viewer)
- Shows title, authors, abstract, scrollable rendered PDF (pdf.js), extracted concepts panel
- Multiple previews open at once (windowed/tiled)
- Preview state persists independently of the canvas

### 3.3 Canvas / Board (the "map")
- Infinite/pannable canvas, each paper = a node (title + metadata chip)
- V1 relationship rendering (2 papers): single edge, labeled with relationship type(s),
  thickness/color encodes strength, click opens drawer with LLM explanation
- Node click → opens paper's preview window
- Build on a graph-native canvas library (React Flow), not hand-rolled SVG

## 4. Backend Spec

### 4.1 Problem Statement (backend-specific)
1. Ingest and persist files
2. Extract structured content from each PDF
3. Use an LLM to extract concepts/claims/methods per paper
4. Compute relationships between paper pairs
5. Store all of this in a graph-shaped model and serve it to the frontend

### 4.2 CSV Manifest Loading
- Endpoint accepts a CSV alongside the PDF batch
- Columns (V1, minimal): filename, title, authors, year, source_url, tags
- Matches CSV rows to files by filename; unmatched PDFs fall back to extracted metadata
- Validate row-by-row, report partial failures rather than rejecting the whole batch

### 4.3 PDF Text Extraction
- Extract raw text + structural sections (title, abstract, sections/headers, references)
- Layout-aware extractor (pymupdf/unstructured) over naive text dumps
- Store extracted text + section map alongside the file reference

### 4.4 LLM Extraction Pipeline
Per paper, produce a structured record: core claims/contributions, methodology,
key datasets/benchmarks, named entities. Extract once, reuse for preview + relationships.

### 4.5 Relationship Detection (V1: pairwise)
1. Embedding similarity — embed abstract + core claims, cosine similarity baseline
2. LLM relationship classification — type (extends/contradicts/shares-method/
   shares-dataset/tangential) + natural-language justification citing overlapping claims

Output: `{ type, strength, explanation, evidence_spans }`.
Design as `compareTwoPapers(paperA, paperB)` so V2's N-paper graph runs it across all pairs.

### 4.6 Data Model (graph-shaped)

```
Paper {
  id, filename, title, authors[], year, source_url,
  raw_text_ref, sections{},
  extraction: { claims[], methods[], datasets[], entities[] },
  embedding_vector,
  created_at
}

Relationship {
  id, paper_a_id, paper_b_id,
  type: enum(extends, contradicts, shares_method, shares_dataset, tangential),
  strength: float,
  explanation: string,
  evidence_spans: [{ paper_id, quote_ref, section }]
}
```

Recommend Neo4j for the relationship layer even in V1.

### 4.7 API Endpoints (V1)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/papers/upload | Upload PDF batch (+ optional CSV manifest) |
| GET | /api/papers/:id | Fetch paper metadata + extraction record |
| GET | /api/papers/:id/preview | Signed URL / stream for PDF rendering |
| POST | /api/relationships/compute | Trigger pairwise comparison for a set of paper IDs |
| GET | /api/graph | Return full node/edge set for canvas render |
| GET | /api/relationships/:id | Fetch full explanation/evidence for one edge |

## 5. Full Tech Stack (V1, with an eye toward school + firm research-team use)

Assumption: unknown yet whether firm/school context requires on-prem hosting for
IP-sensitive papers — stack defaults to cloud-managed services with credible
self-hosted alternatives if that requirement shows up.

### 5.1 Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server components keep PDF/LLM calls off the client |
| Canvas / graph | React Flow | Purpose-built node-edge canvas; avoid hand-rolling |
| PDF rendering | react-pdf (wraps pdf.js) | Renders in-browser without a conversion service |
| Data fetching | TanStack Query | Upload-status polling, graph refetching |
| Styling | Tailwind + shadcn/ui | Fast, easy for a second contributor to pick up |
| Forms/validation | Zod | Catches malformed CSV/metadata early |

### 5.2 Backend / API
| Layer | Choice | Why |
|---|---|---|
| API layer | Next.js API routes for V1; separate Node/Python service once extraction gets heavy | Keep V1 in one deployable app |
| PDF extraction | PyMuPDF (fitz) or unstructured (Python) | Layout-aware, finds section boundaries |
| Why Python enters | Most serious PDF/NLP tooling is Python-first | Next.js frontend + FastAPI sidecar for parsing/embeddings |
| LLM calls | Anthropic API (Claude) | Structured JSON output for extraction records |
| Embeddings | Voyage AI (or text-embedding-3-large) | Semantic-similarity signal |

### 5.3 Data Layer
| Layer | Choice | Why |
|---|---|---|
| Graph database | Neo4j (AuraDB free/managed to start) | Native relationship queries |
| File storage | S3-compatible (AWS S3 / Cloudflare R2) | Keep binary blobs out of the graph DB |
| Metadata / relational | Postgres (Supabase/Neon) | Tabular: users, uploads, job status |
| Vector storage | Neo4j native vector index, or Postgres + pgvector | Avoid a 3rd datastore at V1 scale |

### 5.4 Infra / Deployment
| Layer | Choice | Why |
|---|---|---|
| Hosting (frontend + API) | Vercel | Zero-config Next.js deploys |
| Hosting (Python service) | Railway or Fly.io | Simple small-service deploys |
| Background jobs | Inngest or BullMQ + Redis | Uploads shouldn't block on synchronous parsing |
| Auth (stub early) | Clerk or Auth.js | Cheap to stub now, avoids a bigger rewrite later |

### 5.5 Why this shape specifically
1. Split storage by kind (files / relational / graph) — easier handoff/audit, no migration when usage grows.
2. Background job queue for parsing/LLM calls from day one.
3. Auth stubbed in early — retrofitting later is a bigger rewrite than expected.

If the firm context requires papers to never leave a private network: self-hosted
Neo4j (Docker), self-hosted Postgres, self-hosted S3-compatible storage (MinIO), and a
self-hosted/VPC-restricted LLM endpoint instead of the public Anthropic API.

## 6. Open Questions for Next Pass
- How to handle papers with no clean extractable abstract (scanned PDFs) — OCR fallback?
- At what N does pairwise comparison become too expensive, and what's the fallback?
- Should relationship type be a fixed taxonomy or LLM-generated open vocabulary?
- Versioning: is a re-uploaded updated draft a new node or a new version of the same node?

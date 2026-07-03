# Research Paper AI Cartographer

Treats research papers as nodes on a navigable map. Relationships (citation, semantic
similarity, shared methods, contradiction, extension) are edges. See `spec/` for the
full design spec.

## Structure

- `apps/web` — Next.js 15 frontend + V1 API routes (upload, graph, relationships)
- `apps/extraction-service` — FastAPI sidecar for PDF parsing, LLM extraction, embeddings
  (split out once PDF/LLM work is heavy enough to block request latency)
- `packages/shared-types` — schema definitions shared between web and extraction-service,
  once that's actually needed
- `infra` — local dev services (Neo4j, Postgres, Redis) and Postgres migrations

## Local dev

```
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
```

Then run `apps/web` and `apps/extraction-service` per their own READMEs (TBD).

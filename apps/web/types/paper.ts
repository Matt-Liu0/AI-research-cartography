import { z } from "zod";

// Paper node — spec §4.6, extended per docs/superpowers/specs/2026-07-03-paper-comparison-board-design.md
export const PaperSchema = z.object({
  id: z.string(),
  filename: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().optional(),
  source_url: z.string().optional(),
  status: z.enum(["queued", "parsing", "extracted", "failed"]),
  sections: z.array(z.string()),
  extraction: z.object({
    claims: z.array(z.string()),
    methods: z.array(z.string()),
    datasets: z.array(z.string()),
    entities: z.array(z.string()),
  }),
  created_at: z.string(),
});

export type Paper = z.infer<typeof PaperSchema>;

// Relationship edge — spec §4.6
export const RelationshipSchema = z.object({
  id: z.string(),
  paper_a_id: z.string(),
  paper_b_id: z.string(),
  type: z.enum(["extends", "contradicts", "shares_method", "shares_dataset", "tangential"]),
  strength: z.number(),
  explanation: z.string(),
  evidence_spans: z.array(
    z.object({ paper_id: z.string(), quote_ref: z.string(), section: z.string() })
  ),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

import { PaperSchema, type Paper } from "@/types/paper";
import { z } from "zod";

export async function fetchPapers(): Promise<Paper[]> {
  const res = await fetch("/api/papers");
  if (!res.ok) {
    throw new Error("Failed to fetch papers");
  }
  return z.array(PaperSchema).parse(await res.json());
}

export async function fetchPaper(id: string): Promise<Paper> {
  const res = await fetch(`/api/papers/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch paper");
  }
  return PaperSchema.parse(await res.json());
}

export async function deletePaper(id: string): Promise<void> {
  const res = await fetch(`/api/papers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete paper");
  }
}

export async function retryPaper(id: string): Promise<Paper> {
  const res = await fetch(`/api/papers/${id}/retry`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to retry paper");
  }
  return PaperSchema.parse(await res.json());
}

import { PaperSchema, type Paper } from "@/types/paper";
import { z } from "zod";

async function errorMessageFrom(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  if (body && typeof body.error === "string") {
    return body.error;
  }
  return `${fallback} (${res.status})`;
}

export async function fetchPapers(): Promise<Paper[]> {
  const res = await fetch("/api/papers");
  if (!res.ok) {
    throw new Error(await errorMessageFrom(res, "Failed to fetch papers"));
  }
  return z.array(PaperSchema).parse(await res.json());
}

export async function fetchPaper(id: string): Promise<Paper> {
  const res = await fetch(`/api/papers/${id}`);
  if (!res.ok) {
    throw new Error(await errorMessageFrom(res, "Failed to fetch paper"));
  }
  return PaperSchema.parse(await res.json());
}

export async function deletePaper(id: string): Promise<void> {
  const res = await fetch(`/api/papers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await errorMessageFrom(res, "Failed to delete paper"));
  }
}

export async function retryPaper(id: string): Promise<Paper> {
  const res = await fetch(`/api/papers/${id}/retry`, { method: "POST" });
  if (!res.ok) {
    throw new Error(await errorMessageFrom(res, "Failed to retry paper"));
  }
  return PaperSchema.parse(await res.json());
}

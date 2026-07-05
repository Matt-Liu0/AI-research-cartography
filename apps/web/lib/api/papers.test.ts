import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPapers, fetchPaper, deletePaper, retryPaper } from "./papers";

const paper = {
  id: "1",
  filename: "a.pdf",
  title: "A Paper",
  authors: ["Ada Lovelace"],
  status: "extracted" as const,
  sections: ["Introduction"],
  extraction: { claims: [], methods: [], datasets: [], entities: [] },
  created_at: new Date().toISOString(),
};

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchPapers", () => {
  it("returns parsed papers on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([paper])));
    const result = await fetchPapers();
    expect(result).toEqual([paper]);
  });

  it("throws the server's error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "boom" }, 500))
    );
    await expect(fetchPapers()).rejects.toThrow("boom");
  });

  it("falls back to a generic message when the error body has no message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(null, 500)));
    await expect(fetchPapers()).rejects.toThrow("Failed to fetch papers (500)");
  });
});

describe("fetchPaper", () => {
  it("returns a single parsed paper on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(paper)));
    const result = await fetchPaper("1");
    expect(result).toEqual(paper);
  });

  it("throws on a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(null, 404)));
    await expect(fetchPaper("missing")).rejects.toThrow("Failed to fetch paper (404)");
  });
});

describe("deletePaper", () => {
  it("resolves with no value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(null, 204)));
    await expect(deletePaper("1")).resolves.toBeUndefined();
  });

  it("throws the server's error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "not found" }, 404))
    );
    await expect(deletePaper("1")).rejects.toThrow("not found");
  });
});

describe("retryPaper", () => {
  it("returns the updated paper on success", async () => {
    const queued = { ...paper, status: "queued" as const };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(queued)));
    const result = await retryPaper("1");
    expect(result.status).toBe("queued");
  });

  it("surfaces the 409 conflict message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: "Only failed papers can be retried" }, 409)
      )
    );
    await expect(retryPaper("1")).rejects.toThrow("Only failed papers can be retried");
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiGet, apiPost, apiAuthGet, apiAuthPatch, apiAuthPost, apiAuthDelete } from "./api";

function mockFetchResponse(ok: boolean, status: number, body: unknown = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("api client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("apiGet returns the parsed JSON body on success", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, { id: 1 }));

    const result = await apiGet<{ id: number }>("/api/projects");

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/projects",
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("apiGet throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(false, 404));

    await expect(apiGet("/api/projects/missing")).rejects.toThrow("404");
  });

  it("apiPost sends a JSON body and returns the parsed response", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 201, { ok: true }));

    const result = await apiPost<{ ok: boolean }>("/api/contact", { name: "Test" });

    expect(result).toEqual({ ok: true });
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
  });

  it("apiAuthGet sends the Authorization header", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, []));

    await apiAuthGet("/api/admin/projects", "token-123");

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init).toMatchObject({
      headers: { Authorization: "Bearer token-123" },
    });
  });

  it("apiAuthPatch sends the Authorization header and JSON body", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, { updated: true }));

    await apiAuthPatch("/api/admin/projects/1", "token-123", { title: "Nouveau" });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init).toMatchObject({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({ title: "Nouveau" }),
    });
  });

  it("apiAuthPost throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(false, 400));

    await expect(apiAuthPost("/api/admin/services", "token-123", { title: "x" })).rejects.toThrow(
      "400"
    );
  });

  it("apiAuthDelete resolves without a body on success", async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 204));

    await expect(apiAuthDelete("/api/admin/projects/1", "token-123")).resolves.toBeUndefined();
  });
});

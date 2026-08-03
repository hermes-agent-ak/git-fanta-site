import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchLatestRelease,
  GITHUB_API_VERSION,
  GITHUB_RELEASE_ENDPOINT,
} from "../../src/lib/releases/release-client";

const jsonResponse = (value: unknown, status = 200): Response =>
  new Response(JSON.stringify(value), { status });

describe("GitHub release client", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the documented endpoint headers without a token by default", async () => {
    const calls: Array<{
      input: RequestInfo | URL;
      init: RequestInit | undefined;
    }> = [];
    const fetchImpl = (async (input, init) => {
      calls.push({ input, init });
      return jsonResponse({});
    }) as typeof fetch;

    await fetchLatestRelease({ fetchImpl });

    expect(calls[0]?.input).toBe(GITHUB_RELEASE_ENDPOINT);
    expect(calls[0]?.init?.headers).toEqual({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    });
    expect(calls[0]?.init?.method).toBe("GET");
  });

  it("sends an optional token as a bearer authorization header", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}));

    await fetchLatestRelease({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      token: "build-token",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      GITHUB_RELEASE_ENDPOINT,
      expect.objectContaining({
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
          Authorization: "Bearer build-token",
        },
      }),
    );
  });

  it("reports non-success HTTP responses deterministically", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 429));

    await expect(
      fetchLatestRelease({ fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow("GitHub release request failed with HTTP 429");
  });

  it("reports invalid JSON separately from a transport failure", async () => {
    const invalidJsonFetch = vi.fn(
      async () => new Response("not-json", { status: 200 }),
    );
    const transportFetch = vi.fn(async () => {
      throw new Error("network down");
    });

    await expect(
      fetchLatestRelease({
        fetchImpl: invalidJsonFetch as unknown as typeof fetch,
      }),
    ).rejects.toThrow("GitHub release response was not valid JSON");
    await expect(
      fetchLatestRelease({
        fetchImpl: transportFetch as unknown as typeof fetch,
      }),
    ).rejects.toThrow("GitHub release request failed: network down");
  });

  it("aborts and reports a request timeout without waiting in real time", async () => {
    vi.useFakeTimers();
    const fetchImpl = (async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      })) as typeof fetch;

    const pending = fetchLatestRelease({ fetchImpl, timeoutMs: 50 });
    const rejection = expect(pending).rejects.toThrow(
      "GitHub release request timed out after 50ms",
    );
    await vi.advanceTimersByTimeAsync(50);

    await rejection;
  });
});

export const GITHUB_RELEASE_ENDPOINT =
  "https://api.github.com/repos/hermes-agent-ak/git-fanta/releases/latest";
export const GITHUB_API_VERSION = "2026-03-10";
export const DEFAULT_RELEASE_REQUEST_TIMEOUT_MS = 10_000;

export type ReleaseFetch = typeof fetch;

export interface ReleaseClientOptions {
  fetchImpl?: ReleaseFetch;
  endpoint?: string;
  token?: string;
  timeoutMs?: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function fetchLatestRelease({
  fetchImpl,
  endpoint = GITHUB_RELEASE_ENDPOINT,
  token = process.env.GITHUB_TOKEN,
  timeoutMs = DEFAULT_RELEASE_REQUEST_TIMEOUT_MS,
}: ReleaseClientOptions = {}): Promise<unknown> {
  const requestFetch = fetchImpl ?? globalThis.fetch;

  if (!requestFetch) {
    throw new Error("GitHub release request failed: fetch is unavailable");
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  if (token?.trim()) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    let response: Response;

    try {
      response = await requestFetch(endpoint, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (didTimeout) {
        throw new Error(
          `GitHub release request timed out after ${timeoutMs}ms`,
        );
      }

      throw new Error(`GitHub release request failed: ${errorMessage(error)}`);
    }

    if (!response.ok) {
      throw new Error(
        `GitHub release request failed with HTTP ${response.status}`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new Error("GitHub release response was not valid JSON");
    }
  } finally {
    clearTimeout(timer);
  }
}

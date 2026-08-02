export const DEFAULT_BASE_PATH = "/git-fanta-site/";

function normalizeBase(base: string): string {
  const withLeadingSlash = base.startsWith("/") ? base : `/${base}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

/** Build an internal URL that remains valid when the site is hosted below a project path. */
export function siteHref(path = "/", base = DEFAULT_BASE_PATH): string {
  const normalizedBase = normalizeBase(base);
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

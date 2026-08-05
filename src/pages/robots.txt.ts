export const prerender = true;

export function GET({ site }: { site: URL | undefined }): Response {
  const baseUrl = import.meta.env.BASE_URL;
  const sitemap = new URL(
    `${baseUrl.replace(/\/$/, "/")}sitemap-index.xml`,
    site ?? "http://localhost:4321",
  );

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

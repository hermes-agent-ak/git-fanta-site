import { product } from "../content/product";
import { siteHref } from "./site-url";

export type PageMetadata = Readonly<{
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: "website";
  socialImageUrl: string;
  socialImageAlt: string;
  softwareApplication: Record<string, string> | null;
}>;

type MetadataOptions = Readonly<{
  title: string;
  description: string;
  canonicalPath: string;
  baseUrl?: string;
  site?: URL | undefined;
  includeSoftwareApplication?: boolean;
}>;

const SOCIAL_IMAGE_PATH = "/social/git-fanta-social-preview.svg";
const FALLBACK_SITE = new URL("http://localhost:4321");

function absoluteUrl(
  path: string,
  site: URL | undefined,
  baseUrl?: string,
): string {
  const root = site ?? FALLBACK_SITE;
  return new URL(siteHref(path, baseUrl), root).toString();
}

export function createPageMetadata({
  title,
  description,
  canonicalPath,
  baseUrl,
  site,
  includeSoftwareApplication = false,
}: MetadataOptions): PageMetadata {
  const canonicalUrl = absoluteUrl(canonicalPath, site, baseUrl);
  const socialImageUrl = absoluteUrl(SOCIAL_IMAGE_PATH, site, baseUrl);

  return {
    title,
    description,
    canonicalUrl,
    ogType: "website",
    socialImageUrl,
    socialImageAlt: "Git Fanta — The highly caffeinated Git GUI",
    softwareApplication: includeSoftwareApplication
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: product.name,
          description: product.summary,
          url: absoluteUrl("/", site, baseUrl),
          codeRepository: "https://github.com/hermes-agent-ak/git-fanta",
          license:
            "https://github.com/hermes-agent-ak/git-fanta/blob/main/LICENSE",
        }
      : null,
  };
}

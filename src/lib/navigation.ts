import { siteHref } from "./site-url";

export const navigationItems = [
  {
    label: "Overview",
    href: "/",
    external: false,
    currentWhen: ["/"],
  },
  {
    label: "Repository",
    href: "https://github.com/hermes-agent-ak/git-fanta",
    external: true,
  },
  {
    label: "Releases",
    href: "https://github.com/hermes-agent-ak/git-fanta/releases",
    external: true,
  },
  {
    label: "Issues",
    href: "https://github.com/hermes-agent-ak/git-fanta/issues",
    external: true,
  },
  {
    label: "License",
    href: "https://github.com/hermes-agent-ak/git-fanta/blob/main/LICENSE",
    external: true,
  },
] as const;

export const navigation = navigationItems;

export type NavigationItem = (typeof navigationItems)[number];

/** Resolve an internal item below the configured project base. */
export function navigationHref(item: NavigationItem, baseUrl?: string): string {
  return item.external ? item.href : siteHref(item.href, baseUrl);
}

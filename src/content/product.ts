export const PRODUCT_SOURCE_REPOSITORY = "hermes-agent-ak/git-fanta";

export type ProductClaimStatus = "approved" | "pending-review";

export type ProductClaim = Readonly<{
  id: string;
  text: string;
  sourceRepository: string;
  sourcePath: string;
  sourceSection: string;
  status: ProductClaimStatus;
}>;

export type ProductContent = Readonly<{
  name: string;
  tagline: string;
  summary: string;
  claims: readonly ProductClaim[];
}>;

export type ProductClaimCandidate = Omit<ProductClaim, "status"> & {
  readonly status: string;
};

export type ProductContentCandidate = Omit<ProductContent, "claims"> & {
  readonly claims: readonly ProductClaimCandidate[];
};

export const product = {
  name: "Git Fanta",
  tagline: "The highly caffeinated Git GUI",
  summary:
    "Git Fanta is a powerful Git GUI with a slick and intuitive user interface.",
  claims: [
    {
      id: "tagline",
      text: "The highly caffeinated Git GUI",
      sourceRepository: PRODUCT_SOURCE_REPOSITORY,
      sourcePath: "README.md",
      sourceSection: "Title",
      status: "approved",
    },
    {
      id: "summary",
      text: "Git Fanta is a powerful Git GUI with a slick and intuitive user interface.",
      sourceRepository: PRODUCT_SOURCE_REPOSITORY,
      sourcePath: "README.md",
      sourceSection: "Opening description",
      status: "approved",
    },
    {
      id: "relationship",
      text: "Git Fanta is a fork of git-cola, David Aguilar's Git GUI, and inherits its history and its GPL-2.0 licence.",
      sourceRepository: PRODUCT_SOURCE_REPOSITORY,
      sourcePath: "README.md",
      sourceSection: "Based on git-cola",
      status: "approved",
    },
    {
      id: "dag-description",
      text: "git-fanta-dag is an advanced Git history visualizer that presents git log's powerful features in an easy to use graphical interface.",
      sourceRepository: PRODUCT_SOURCE_REPOSITORY,
      sourcePath: "docs/git-fanta-dag.rst",
      sourceSection: "DESCRIPTION",
      status: "approved",
    },
  ],
} as const satisfies ProductContent;

/** Return deterministic issues for content that has not passed source review. */
export function validateProductContent(
  content: ProductContentCandidate,
): string[] {
  const issues: string[] = [];

  if (!content.name.trim()) {
    issues.push("missing product name");
  }

  content.claims.forEach((claim, index) => {
    const label = claim.id.trim() || `claim-${index + 1}`;

    if (!claim.id.trim()) {
      issues.push(`claim "${label}": missing claim id`);
    }
    if (!claim.text.trim()) {
      issues.push(`claim "${label}": missing claim text`);
    }
    if (!claim.sourcePath.trim()) {
      issues.push(`claim "${label}": missing source path`);
    }
    if (claim.sourceRepository !== PRODUCT_SOURCE_REPOSITORY) {
      issues.push(`claim "${label}": wrong source repository`);
    }
    if (!claim.sourceSection.trim()) {
      issues.push(`claim "${label}": missing source section`);
    }
    if (claim.status !== "approved" && claim.status !== "pending-review") {
      issues.push(`claim "${label}": invalid status`);
    }
  });

  return issues;
}

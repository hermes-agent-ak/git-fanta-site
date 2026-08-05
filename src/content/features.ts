export const FEATURE_SOURCE_REPOSITORY = "hermes-agent-ak/git-fanta";

export type FeatureTone = "orange" | "green" | "neutral";
export type FeatureStatus = "approved" | "pending-review";

export type FeatureContent = Readonly<{
  id: string;
  title: string;
  description: string;
  tone: FeatureTone;
  sourceRepository: string;
  sourcePath: string;
  sourceSection: string;
  status: FeatureStatus;
  evidenceNote?: string;
}>;

export const features = [
  {
    id: "git-gui",
    title: "A focused Git GUI",
    description:
      "Git Fanta is a powerful Git GUI with a slick and intuitive user interface.",
    tone: "orange",
    sourceRepository: FEATURE_SOURCE_REPOSITORY,
    sourcePath: "README.md",
    sourceSection: "Opening description",
    status: "approved",
  },
  {
    id: "history-visualizer",
    title: "History you can see",
    description:
      "The advanced DAG view presents git log features in a graphical interface.",
    tone: "green",
    sourceRepository: FEATURE_SOURCE_REPOSITORY,
    sourcePath: "docs/git-fanta-dag.rst",
    sourceSection: "DESCRIPTION",
    status: "approved",
  },
  {
    id: "commit-diffing",
    title: "Compare commits directly",
    description:
      "Select commits in the list or graph view and diff them from the context menu.",
    tone: "neutral",
    sourceRepository: FEATURE_SOURCE_REPOSITORY,
    sourcePath: "docs/git-fanta-dag.rst",
    sourceSection: "DIFF COMMITS",
    status: "approved",
  },
  {
    id: "alongside-git-cola",
    title: "A separate installation",
    description:
      "Git Fanta installs alongside git-cola without replacing or removing it.",
    tone: "orange",
    sourceRepository: FEATURE_SOURCE_REPOSITORY,
    sourcePath: "README.md",
    sourceSection: "Linux",
    status: "approved",
  },
] as const satisfies readonly FeatureContent[];

export function validateFeatureContent(
  content: readonly FeatureContent[],
): string[] {
  return content.flatMap((feature, index) => {
    const label = feature.id.trim() || `feature-${index + 1}`;
    const issues: string[] = [];

    if (!feature.id.trim()) issues.push(`${label}: missing id`);
    if (!feature.title.trim()) issues.push(`${label}: missing title`);
    if (!feature.description.trim())
      issues.push(`${label}: missing description`);
    if (feature.sourceRepository !== FEATURE_SOURCE_REPOSITORY) {
      issues.push(`${label}: wrong source repository`);
    }
    if (!feature.sourcePath.trim())
      issues.push(`${label}: missing source path`);
    if (!feature.sourceSection.trim()) {
      issues.push(`${label}: missing source section`);
    }
    if (feature.status !== "approved" && feature.status !== "pending-review") {
      issues.push(`${label}: invalid status`);
    }

    return issues;
  });
}

const featureIssues = validateFeatureContent(features);

if (featureIssues.length > 0) {
  throw new Error(`Invalid feature content: ${featureIssues.join("; ")}`);
}

export const approvedFeatures = features.filter(
  (feature) => feature.status === "approved",
);

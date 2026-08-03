export type ExperienceNode = "root" | "commit" | "branch" | "merge";

export type ExperienceTone = "orange" | "green" | "red" | "neutral";

export type ExperienceSection = {
  readonly id: string;
  readonly href: `#${string}`;
  readonly label: string;
  readonly ariaLabel: string;
  readonly ref: `refs/heads/${string}`;
  readonly node: ExperienceNode;
  readonly tone: ExperienceTone;
};

export type MotionIntent = {
  readonly name:
    "commit-resolve" | "branch-trace" | "diff-reveal" | "ref-transition";
  readonly properties: readonly (
    "transform" | "opacity" | "color" | "stroke-dashoffset"
  )[];
  readonly reducedMotion: "static" | "fade";
  readonly maxDurationMs: number;
};

export const experienceSections = [
  {
    id: "foundation",
    href: "#foundation",
    label: "Foundation",
    ariaLabel: "Foundation overview",
    ref: "refs/heads/main",
    node: "root",
    tone: "neutral",
  },
  {
    id: "branchline",
    href: "#branchline",
    label: "Branchline",
    ariaLabel: "Branchline navigation",
    ref: "refs/heads/feature/ui",
    node: "branch",
    tone: "orange",
  },
  {
    id: "git-tree",
    href: "#git-tree",
    label: "Git tree",
    ariaLabel: "Git tree visual grammar",
    ref: "refs/heads/feature/ui",
    node: "commit",
    tone: "green",
  },
  {
    id: "motion",
    href: "#motion",
    label: "Motion",
    ariaLabel: "Progressive motion",
    ref: "refs/heads/feature/ui",
    node: "commit",
    tone: "orange",
  },
  {
    id: "handoff",
    href: "#handoff",
    label: "Handoff",
    ariaLabel: "Phase handoff",
    ref: "refs/heads/release/next",
    node: "merge",
    tone: "neutral",
  },
] as const satisfies readonly ExperienceSection[];

export function resolveExperienceSectionId(
  sections: readonly ExperienceSection[],
  requestedId?: string,
): string | undefined {
  if (requestedId && sections.some((section) => section.id === requestedId)) {
    return requestedId;
  }

  return sections[0]?.id;
}

export const motionIntents = [
  {
    name: "commit-resolve",
    properties: ["transform", "opacity"],
    reducedMotion: "static",
    maxDurationMs: 240,
  },
  {
    name: "branch-trace",
    properties: ["opacity", "stroke-dashoffset"],
    reducedMotion: "static",
    maxDurationMs: 320,
  },
  {
    name: "diff-reveal",
    properties: ["transform", "opacity"],
    reducedMotion: "fade",
    maxDurationMs: 200,
  },
  {
    name: "ref-transition",
    properties: ["color", "opacity"],
    reducedMotion: "static",
    maxDurationMs: 180,
  },
] as const satisfies readonly MotionIntent[];

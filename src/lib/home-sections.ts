import {
  experienceSections,
  type ExperienceSection,
} from "./experience-sections";

export type HomeContentKey =
  | "hero"
  | "product-showcase"
  | "features"
  | "workflow"
  | "download"
  | "open-source";

export type HomeSection = ExperienceSection & {
  readonly heading: string;
  readonly contentKey: HomeContentKey;
};

export const homeSections = [
  {
    ...experienceSections[0],
    heading: "A clearer way to work with Git",
    contentKey: "hero",
  },
  {
    ...experienceSections[1],
    heading: "A Git GUI with room to think",
    contentKey: "product-showcase",
  },
  {
    ...experienceSections[2],
    heading: "The everyday Git surface, made visible",
    contentKey: "features",
  },
  {
    ...experienceSections[3],
    heading: "See the history behind the change",
    contentKey: "workflow",
  },
  {
    ...experienceSections[4],
    heading: "Pick the release that fits your setup",
    contentKey: "download",
  },
  {
    ...experienceSections[5],
    heading: "Open by design, open source by heritage",
    contentKey: "open-source",
  },
] as const satisfies readonly HomeSection[];

export function getHomeSection(id: string): HomeSection | undefined {
  return homeSections.find((section) => section.id === id);
}

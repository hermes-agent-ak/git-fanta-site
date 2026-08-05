type BranchlineRoot = Pick<Document, "getElementById" | "querySelector">;
type BranchlineView = {
  IntersectionObserver?:
    | (new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) => IntersectionObserver)
    | undefined;
};

export function initializeBranchlineEnhancement(
  root: BranchlineRoot,
  view: BranchlineView,
): void {
  const nav = root.querySelector<HTMLElement>("[data-branchline-nav]");

  if (!nav) return;

  const links = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
  );
  const sections = links
    .map((link) => root.getElementById(link.hash.slice(1)))
    .filter((section): section is HTMLElement => section !== null);
  const sectionIds = new Set(sections.map((section) => section.id));
  let pendingNavigation: { id: string; expiresAt: number } | undefined;

  const setActive = (id: string) => {
    if (!sectionIds.has(id)) return;

    links.forEach((link) => {
      const isActive = link.hash.slice(1) === id;
      link.dataset.active = String(isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.hash.slice(1);
      if (id) {
        setActive(id);
        pendingNavigation = {
          id,
          expiresAt: Date.now() + 1000,
        };
      }
    });
  });

  if (view.IntersectionObserver) {
    const observer = new view.IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )[0];

        if (!visible) return;

        if (pendingNavigation) {
          if (Date.now() < pendingNavigation.expiresAt) {
            if (visible.target.id !== pendingNavigation.id) return;
          }

          pendingNavigation = undefined;
        }

        setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
  }
}

if (typeof document !== "undefined") {
  initializeBranchlineEnhancement(document, {
    IntersectionObserver:
      typeof IntersectionObserver === "undefined"
        ? undefined
        : IntersectionObserver,
  });
}

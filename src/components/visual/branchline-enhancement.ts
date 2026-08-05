type BranchlineRoot = Pick<Document, "getElementById" | "querySelector"> &
  Partial<Pick<Document, "addEventListener" | "documentElement">>;

type BranchlineView = Partial<
  Pick<Window, "addEventListener" | "requestAnimationFrame">
>;

const ACTIVE_LINE_GAP_PX = 8;

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
  let pendingNavigationId: string | undefined;
  let updateScheduled = false;

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

  const isAtDocumentEnd = () => {
    const documentElement = root.documentElement;
    if (!documentElement) return false;

    return (
      documentElement.scrollTop + documentElement.clientHeight >=
      documentElement.scrollHeight - 1
    );
  };

  const resolveActiveSectionId = () => {
    if (isAtDocumentEnd()) return sections.at(-1)?.id;

    const activeLine =
      Math.max(nav.getBoundingClientRect().bottom, 0) + ACTIVE_LINE_GAP_PX;
    let activeSection = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top > activeLine) break;
      activeSection = section;
    }

    return activeSection?.id;
  };

  const synchronizeActiveSection = () => {
    updateScheduled = false;
    const activeId = resolveActiveSectionId();

    if (!activeId) return;

    if (pendingNavigationId && activeId !== pendingNavigationId) return;

    pendingNavigationId = undefined;
    setActive(activeId);
  };

  const scheduleSynchronization = () => {
    if (updateScheduled) return;

    if (view.requestAnimationFrame) {
      updateScheduled = true;
      view.requestAnimationFrame(synchronizeActiveSection);
      return;
    }

    synchronizeActiveSection();
  };

  const releasePendingNavigation = () => {
    pendingNavigationId = undefined;
    scheduleSynchronization();
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.hash.slice(1);
      if (!id) return;

      pendingNavigationId = id;
      setActive(id);
    });
  });

  root.addEventListener?.("scroll", scheduleSynchronization, {
    passive: true,
  });
  root.addEventListener?.("scrollend", releasePendingNavigation, {
    passive: true,
  });
  root.addEventListener?.("wheel", releasePendingNavigation, {
    passive: true,
  });
  root.addEventListener?.("touchstart", releasePendingNavigation, {
    passive: true,
  });
  view.addEventListener?.("resize", scheduleSynchronization, {
    passive: true,
  });

  synchronizeActiveSection();
}

if (typeof document !== "undefined") {
  initializeBranchlineEnhancement(document, window);
}

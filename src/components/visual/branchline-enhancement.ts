const nav = document.querySelector<HTMLElement>("[data-branchline-nav]");

if (nav) {
  const links = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
  );
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((section): section is HTMLElement => section !== null);

  const setActive = (id: string) => {
    links.forEach((link) => {
      const isActive = link.hash.slice(1) === id;
      link.classList.toggle("branchline-nav__link--active", isActive);
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
      if (id) setActive(id);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )[0];

        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
  }
}

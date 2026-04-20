export function initArticleTabs() {
  const setup = () => {
    const main = document.querySelector("main[data-article-view]");
    if (!main || main.dataset.articleTabsInitialized === "true") return;

    main.dataset.articleTabsInitialized = "true";

    const buttons = main.querySelectorAll("[data-view-btn]");
    const chapterLinks = main.querySelectorAll("[data-chapter-link]");
    let currentView = main.getAttribute("data-article-view") || "article";

    const setView = () => {
      main.setAttribute("data-article-view", currentView);
      buttons.forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-view-btn") === currentView,
        );
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentView = btn.getAttribute("data-view-btn") || "article";
        setView();
      });
    });

    chapterLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetHash = link.getAttribute("href") || "";
        if (!targetHash.startsWith("#")) return;

        const targetElement = main.querySelector(targetHash);
        if (!targetElement) return;

        event.preventDefault();
        currentView = "article";
        setView();

        requestAnimationFrame(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", targetHash);
        });
      });
    });

    setView();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
    return;
  }

  setup();
}

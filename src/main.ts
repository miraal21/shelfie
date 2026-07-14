import "./style/global.css";

import {
  renderHomePage,
  type NavigateFunction
} from "./pages/HomePage";

import { renderArchivePage } from "./pages/ArchivePages";
import { renderStatsPage } from "./pages/StatsPage";

import {
  applySettings,
  loadSettings,
  renderSettingsPage
} from "./pages/SettingsPage";

/**
 * Find the main app element from index.html.
 *
 * index.html should contain:
 * <div id="app"></div>
 */
const app =
  document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error(
    'Could not find <div id="app"></div> in index.html.'
  );
}

/**
 * Some pages create things that keep running.
 *
 * For example, HomePage creates a timer.
 * This function lets us stop those things before opening another page.
 */
let cleanupCurrentPage:
  | (() => void)
  | undefined;

/**
 * Change the current page by changing the URL hash.
 *
 * Examples:
 * #home
 * #archive
 * #stats
 * #settings
 */
const navigate: NavigateFunction = (
  page
): void => {
  window.location.hash = page;
};

/**
 * Read the current URL hash and display the correct page.
 */
function renderCurrentPage(): void {
  /**
   * Clean up the page that was previously open.
   *
   * On HomePage, this stops the timer.
   */
  cleanupCurrentPage?.();
  cleanupCurrentPage = undefined;

  /**
   * Remove the # symbol from the URL.
   *
   * For example:
   * "#archive" becomes "archive".
   *
   * If there is no hash, use "home".
   */
  const page =
    window.location.hash
      .replace("#", "")
      .toLowerCase() || "home";

  switch (page) {
    case "archive":
      renderArchivePage(app, navigate);
      break;

    case "stats":
      renderStatsPage(app, navigate);
      break;

    case "settings":
      renderSettingsPage(app, navigate);
      break;

    case "home":
    default:
      /**
       * HomePage returns a cleanup function.
       * We save it so the timer can be stopped later.
       */
      cleanupCurrentPage =
        renderHomePage(app, navigate);
      break;
  }
}

/**
 * Load and apply saved settings before showing the first page.
 */
applySettings(loadSettings());

/**
 * Re-render the page whenever the URL hash changes.
 */
window.addEventListener(
  "hashchange",
  renderCurrentPage
);

/**
 * Display the first page when the application starts.
 */
renderCurrentPage();
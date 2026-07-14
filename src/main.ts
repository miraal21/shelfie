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
 * The exclamation mark at the end tells TypeScript:
 * "This element definitely exists."
 *
 * Your index.html must contain:
 * <div id="app"></div>
 */
const app =
  document.querySelector<HTMLDivElement>("#app")!;

/**
 * This is an extra safety check for the browser.
 *
 * TypeScript already accepts app because of the ! above,
 * but this still gives a clear error if index.html is wrong.
 */
if (!app) {
  throw new Error(
    'Could not find <div id="app"></div> in index.html.'
  );
}

/**
 * Some pages create things that keep running.
 *
 * HomePage creates a timer, so it returns a cleanup function.
 * We save that function here and call it before changing pages.
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
   * Stop anything still running on the previous page.
   *
   * For example, this stops the HomePage timer.
   */
  cleanupCurrentPage?.();
  cleanupCurrentPage = undefined;

  /**
   * Read the current page name from the URL.
   *
   * "#archive" becomes "archive".
   * An empty hash becomes "home".
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
       * We store it so it can stop the timer later.
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
 * Re-render whenever the URL hash changes.
 */
window.addEventListener(
  "hashchange",
  renderCurrentPage
);

/**
 * Show the first page when the app starts.
 */
renderCurrentPage();
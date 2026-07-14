import { createHeader } from "../components/Header";
import {
  createPopup,
  createPopupButton
} from "../components/Popup";

import {
  formatSeconds,
  loadStats,
  resetStats
} from "../game/Score";

import type { NavigateFunction } from "./HomePage";

/**
 * Render the player statistics page.
 */
export function renderStatsPage(
  container: HTMLElement,
  navigate: NavigateFunction
): void {
  container.replaceChildren();

  const stats = loadStats();

  const header = createHeader({
    title: "Statistics",

    onArchiveClick: () =>
      navigate("archive"),

    onStatsClick: () =>
      navigate("home"),

    onSettingsClick: () =>
      navigate("settings")
  });

  const main =
    document.createElement("main");

  main.className = "stats-page";

  const heading =
    document.createElement("h2");

  heading.textContent =
    "Your Shelfie statistics";

  /**
   * Avoid dividing by zero when no games were played.
   */
  const averageSeconds =
    stats.gamesPlayed > 0
      ? Math.round(
          stats.totalSeconds /
            stats.gamesPlayed
        )
      : 0;

  const averageMoves =
    stats.gamesPlayed > 0
      ? (
          stats.totalMoves /
          stats.gamesPlayed
        ).toFixed(1)
      : "0";

  const averageHints =
    stats.gamesPlayed > 0
      ? (
          stats.totalHints /
          stats.gamesPlayed
        ).toFixed(1)
      : "0";

  const statistics = [
    {
      label: "Puzzles solved",
      value: String(stats.gamesPlayed)
    },
    {
      label: "Current streak",
      value: String(stats.currentStreak)
    },
    {
      label: "Longest streak",
      value: String(stats.longestStreak)
    },
    {
      label: "Best time",
      value:
        stats.bestSeconds === null
          ? "--"
          : formatSeconds(
              stats.bestSeconds
            )
    },
    {
      label: "Average time",
      value:
        stats.gamesPlayed === 0
          ? "--"
          : formatSeconds(
              averageSeconds
            )
    },
    {
      label: "Average moves",
      value: averageMoves
    },
    {
      label: "Average hints",
      value: averageHints
    },
    {
      label: "Books organized",
      value: String(
        stats.gamesPlayed * 6
      )
    }
  ];

  const statsGrid =
    document.createElement("div");

  statsGrid.className = "stats-grid";

  statistics.forEach((statistic) => {
    const card =
      document.createElement("article");

    card.className = "stats-card";

    const value =
      document.createElement("strong");

    value.className =
      "stats-card__value";

    value.textContent = statistic.value;

    const label =
      document.createElement("span");

    label.className =
      "stats-card__label";

    label.textContent = statistic.label;

    card.append(value, label);
    statsGrid.append(card);
  });

  const controls =
    document.createElement("div");

  controls.className = "page-controls";

  const homeButton =
    document.createElement("button");

  homeButton.type = "button";
  homeButton.className = "game-button";
  homeButton.textContent =
    "Back to puzzle";

  homeButton.addEventListener(
    "click",
    () => navigate("home")
  );

  const resetButton =
    document.createElement("button");

  resetButton.type = "button";
  resetButton.className =
    "game-button game-button--danger";

  resetButton.textContent =
    "Reset statistics";

  resetButton.addEventListener(
    "click",
    () => {
      const content =
        document.createElement("div");

      const message =
        document.createElement("p");

      message.textContent =
        "This permanently deletes your streaks and completed-puzzle history.";

      const confirmButton =
        createPopupButton(
          "Delete statistics",
          () => {
            resetStats();
            confirmationPopup.close();
            renderStatsPage(
              container,
              navigate
            );
          }
        );

      const cancelButton =
        createPopupButton(
          "Cancel",
          () =>
            confirmationPopup.close(),
          true
        );

      content.append(
        message,
        confirmButton,
        cancelButton
      );

      const confirmationPopup =
        createPopup({
          title: "Reset statistics?",
          content
        });

      confirmationPopup.open();
    }
  );

  controls.append(
    homeButton,
    resetButton
  );

  main.append(
    heading,
    statsGrid,
    controls
  );

  container.append(
    header.element,
    main
  );
}
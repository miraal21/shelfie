import { createHeader } from "../components/Header";

import {
  PUZZLES,
  selectArchivePuzzle
} from "../game/PuzzleEngine";

import { loadStats } from "../game/Score";

import type { NavigateFunction } from "./HomePage";

/**
 * Render the archive page.
 */
export function renderArchivePage(
  container: HTMLElement,
  navigate: NavigateFunction
): void {
  container.replaceChildren();

  const stats = loadStats();

  const header = createHeader({
    title: "Archive",

    onArchiveClick: () =>
      navigate("home"),

    onStatsClick: () =>
      navigate("stats"),

    onSettingsClick: () =>
      navigate("settings")
  });

  const main =
    document.createElement("main");

  main.className = "archive-page";

  const heading =
    document.createElement("h2");

  heading.textContent = "Puzzle archive";

  const description =
    document.createElement("p");

  description.textContent =
    "Play earlier Shelfie puzzles whenever you like.";

  const puzzleGrid =
    document.createElement("div");

  puzzleGrid.className =
    "archive-grid";

  PUZZLES.forEach((puzzle) => {
    const card =
      document.createElement("article");

    card.className = "archive-card";

    const completed =
      stats.completedPuzzleIds.includes(
        puzzle.id
      );

    const number =
      document.createElement("p");

    number.className =
      "archive-card__number";

    number.textContent =
      `Puzzle #${puzzle.number}`;

    const title =
      document.createElement("h3");

    title.textContent = puzzle.title;

    const difficulty =
      document.createElement("p");

    difficulty.textContent =
      `Difficulty: ${puzzle.difficulty}`;

    const status =
      document.createElement("p");

    status.className =
      completed
        ? "archive-card__status archive-card__status--complete"
        : "archive-card__status";

    status.textContent = completed
      ? "✓ Completed"
      : "Not completed";

    const playButton =
      document.createElement("button");

    playButton.type = "button";
    playButton.className = "game-button";

    playButton.textContent = completed
      ? "Play again"
      : "Play puzzle";

    playButton.addEventListener(
      "click",
      () => {
        selectArchivePuzzle(puzzle.id);
        navigate("home");
      }
    );

    card.append(
      number,
      title,
      difficulty,
      status,
      playButton
    );

    puzzleGrid.append(card);
  });

  const backButton =
    document.createElement("button");

  backButton.type = "button";
  backButton.className =
    "game-button game-button--secondary";

  backButton.textContent =
    "Back to today's puzzle";

  backButton.addEventListener(
    "click",
    () => navigate("home")
  );

  main.append(
    heading,
    description,
    puzzleGrid,
    backButton
  );

  container.append(
    header.element,
    main
  );
}
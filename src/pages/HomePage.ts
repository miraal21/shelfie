import { createHeader } from "../components/Header";
import { createShelf } from "../components/shelf";
import {
  createClueList,
  type ClueStatus
} from "../components/ClueList";
import {
  createPopup,
  createPopupButton
} from "../components/Popup";
import { createTimer } from "../components/Timer";

import {
  arrangeBooks,
  checkPuzzle,
  getClueText,
  getDailyPuzzle,
  getSelectedPuzzle
} from "../game/PuzzleEngine";

import { getHint } from "../game/HintEngine";

import {
  calculateStars,
  createShareText,
  recordGameResult,
  type GameResult
} from "../game/Score";

/**
 * Function used by pages to change screen.
 */
export type NavigateFunction = (
  page:
    | "home"
    | "archive"
    | "stats"
    | "settings"
) => void;

/**
 * Render the complete game screen.
 *
 * The returned function cleans up the timer when
 * the player leaves the page.
 */
export function renderHomePage(
  container: HTMLElement,
  navigate: NavigateFunction
): () => void {
  container.replaceChildren();

  /**
   * Use an archive puzzle if one was selected.
   * Otherwise use today's puzzle.
   */
  const puzzle =
    getSelectedPuzzle() ?? getDailyPuzzle();

  let checkCount = 0;
  let hintCount = 0;
  let hasFinished = false;

  /**
   * Build readable clue data for ClueList.
   */
  const clueData = puzzle.clues.map((clue) => ({
    id: clue.id,
    text: getClueText(puzzle, clue),
    status: "unchecked" as ClueStatus
  }));

  /**
   * Create the header.
   */
  const header = createHeader({
    title: "Shelfie",
    puzzleNumber: puzzle.number,

    onArchiveClick: () =>
      navigate("archive"),

    onStatsClick: () =>
      navigate("stats"),

    onSettingsClick: () =>
      navigate("settings")
  });

  /**
   * Page introduction.
   */
  const introduction =
    document.createElement("section");

  introduction.className =
    "home-introduction";

  const puzzleTitle =
    document.createElement("h2");

  puzzleTitle.textContent = puzzle.title;

  const instructions =
    document.createElement("p");

  instructions.textContent =
    "Drag the books, or tap two books to swap them.";

  const difficulty =
    document.createElement("p");

  difficulty.className =
    "home-introduction__difficulty";

  difficulty.textContent =
    `Difficulty: ${puzzle.difficulty}`;

  introduction.append(
    puzzleTitle,
    instructions,
    difficulty
  );

  /**
   * Create timer.
   */
  const timer = createTimer({
    autoStart: true
  });

  /**
   * Move counter.
   */
  const moveDisplay =
    document.createElement("span");

  moveDisplay.className = "game-stat";
  moveDisplay.textContent = "Moves: 0";

  /**
   * Check counter.
   */
  const checkDisplay =
    document.createElement("span");

  checkDisplay.className = "game-stat";
  checkDisplay.textContent = "Checks: 0";

  /**
   * Information row.
   */
  const informationRow =
    document.createElement("div");

  informationRow.className = "game-info";

  informationRow.append(
    timer.element,
    moveDisplay,
    checkDisplay
  );

  /**
   * Create shelf in the puzzle's starting order.
   */
  const shelf = createShelf({
    books: arrangeBooks(
      puzzle,
      puzzle.startingOrder
    ),

    onOrderChange: (_books, moves) => {
      moveDisplay.textContent =
        `Moves: ${moves}`;
    }
  });

  /**
   * Create clue list.
   */
  const clueList =
    createClueList(clueData);

  /**
   * Buttons.
   */
  const controls =
    document.createElement("div");

  controls.className = "game-controls";

  const hintButton =
    document.createElement("button");

  hintButton.type = "button";
  hintButton.className =
    "game-button game-button--secondary";

  hintButton.textContent = "Hint";

  const checkButton =
    document.createElement("button");

  checkButton.type = "button";
  checkButton.className = "game-button";
  checkButton.textContent = "Check shelf";

  controls.append(
    hintButton,
    checkButton
  );

  /**
   * Display a hint popup.
   */
  hintButton.addEventListener("click", () => {
    if (hasFinished) {
      return;
    }

    const hint = getHint(
      puzzle,
      shelf.getBookOrder(),
      hintCount
    );

    hintCount += 1;

    const hintPopup = createPopup({
      title: `Hint ${hintCount}`,
      content: hint.text
    });

    hintPopup.open();
  });

  /**
   * Check the player's shelf.
   */
  checkButton.addEventListener(
    "click",
    async () => {
      if (hasFinished) {
        return;
      }

      checkCount += 1;

      checkDisplay.textContent =
        `Checks: ${checkCount}`;

      const result = checkPuzzle(
        puzzle,
        shelf.getBookOrder()
      );

      /**
       * Convert true/false clue results into
       * ClueList status values.
       */
      const clueStatuses: Record<
        string,
        ClueStatus
      > = {};

      Object.entries(
        result.clueResults
      ).forEach(([clueId, satisfied]) => {
        clueStatuses[clueId] = satisfied
          ? "satisfied"
          : "unsatisfied";
      });

      clueList.updateStatuses(
        clueStatuses
      );

      /**
       * Puzzle is not finished yet.
       */
      if (!result.solved) {
        checkButton.textContent =
          `${result.satisfiedCount}/${result.totalClues} clues correct`;

        window.setTimeout(() => {
          checkButton.textContent =
            "Check shelf";
        }, 1600);

        return;
      }

      /**
       * Finish the puzzle.
       */
      hasFinished = true;

      timer.stop();
      shelf.setDisabled(true);

      checkButton.disabled = true;
      hintButton.disabled = true;

      const stars = calculateStars(
        timer.getSeconds(),
        shelf.getMoveCount(),
        hintCount
      );

      const gameResult: GameResult = {
        puzzleId: puzzle.id,
        puzzleNumber: puzzle.number,
        completedAt:
          new Date().toISOString(),
        seconds: timer.getSeconds(),
        moves: shelf.getMoveCount(),
        checks: checkCount,
        hints: hintCount,
        stars
      };

      recordGameResult(gameResult);

      /**
       * Build result-popup content.
       */
      const resultContent =
        document.createElement("div");

      resultContent.className =
        "result-content";

      const starDisplay =
        document.createElement("p");

      starDisplay.className =
        "result-stars";

      starDisplay.textContent =
        "⭐".repeat(stars);

      const timeResult =
        document.createElement("p");

      timeResult.textContent =
        `Time: ${timer.getFormattedTime()}`;

      const moveResult =
        document.createElement("p");

      moveResult.textContent =
        `Moves: ${shelf.getMoveCount()}`;

      const hintResult =
        document.createElement("p");

      hintResult.textContent =
        `Hints: ${hintCount}`;

      const shareButton =
        createPopupButton(
          "Share result",
          async () => {
            const shareText =
              createShareText(gameResult);

            try {
              /**
               * Use the phone's share menu when available.
               */
              if (navigator.share) {
                await navigator.share({
                  text: shareText
                });

                return;
              }

              /**
               * Otherwise copy the result.
               */
              await navigator.clipboard.writeText(
                shareText
              );

              shareButton.textContent =
                "Copied!";
            } catch (error) {
              console.error(
                "Could not share result.",
                error
              );
            }
          }
        );

      const statsButton =
        createPopupButton(
          "View statistics",
          () => navigate("stats"),
          true
        );

      resultContent.append(
        starDisplay,
        timeResult,
        moveResult,
        hintResult,
        shareButton,
        statsButton
      );

      const resultPopup = createPopup({
        title: "Shelf complete!",
        content: resultContent,
        closeOnBackdrop: false
      });

      resultPopup.open();
    }
  );

  /**
   * Put everything on the page.
   */
  const main =
    document.createElement("main");

  main.className = "home-page";

  main.append(
    introduction,
    informationRow,
    shelf.element,
    clueList.element,
    controls
  );

  container.append(
    header.element,
    main
  );

  /**
   * Stop the timer when changing pages.
   */
  return () => {
    timer.stop();
  };
}